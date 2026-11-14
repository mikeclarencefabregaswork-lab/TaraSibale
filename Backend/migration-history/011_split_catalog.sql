-- Run in the migration runner's transaction. Block legacy writes before the copy.
LOCK TABLE bookings, reviews, resources IN ACCESS EXCLUSIVE MODE;

CREATE TABLE attractions (
  id text PRIMARY KEY,
  data jsonb NOT NULL,
  CHECK (jsonb_typeof(data) = 'object' AND COALESCE(data ->> 'id' = id, false)),
  CHECK (NOT data ? 'gallery' OR jsonb_string_array(data -> 'gallery')),
  CHECK (
      jsonb_has_strings(data, ARRAY['id','name','category','image','description','locationName','entryFee','bestTime'])
      AND jsonb_string_array(data -> 'highlights')
      AND COALESCE(jsonb_typeof(data -> 'lat') = 'number' AND jsonb_typeof(data -> 'lng') = 'number', false)
  )
);

CREATE TABLE accommodations (
  id text PRIMARY KEY,
  data jsonb NOT NULL,
  CHECK (jsonb_typeof(data) = 'object' AND COALESCE(data ->> 'id' = id, false)),
  CHECK (NOT data ? 'gallery' OR jsonb_string_array(data -> 'gallery')),
  CHECK (
      jsonb_has_strings(data, ARRAY['id','name','type','image','location','description','contactPhone'])
      AND jsonb_string_array(data -> 'amenities') AND jsonb_string_array(data -> 'roomTypes')
      AND (COALESCE(jsonb_typeof(data -> 'pricePerNight') = 'number' AND (data ->> 'pricePerNight')::numeric >= 0, false) OR COALESCE(data->>'bookingMode' = 'reference-only' AND data->'pricePerNight' = 'null'::jsonb, false))
      AND (COALESCE(jsonb_typeof(data -> 'maxGuests') = 'number' AND (data ->> 'maxGuests')::numeric >= 1, false) OR COALESCE(data->>'bookingMode' = 'reference-only' AND data->'maxGuests' = 'null'::jsonb, false))
      AND (COALESCE(jsonb_typeof(data -> 'coordinates') = 'object'
        AND jsonb_typeof(data #> '{coordinates,lat}') = 'number'
        AND jsonb_typeof(data #> '{coordinates,lng}') = 'number', false) OR COALESCE(data->>'bookingMode' = 'reference-only' AND data->'coordinates' = 'null'::jsonb, false))
  )
);

CREATE TABLE ferry_routes (
  id text PRIMARY KEY,
  data jsonb NOT NULL,
  CHECK (jsonb_typeof(data) = 'object' AND COALESCE(data ->> 'id' = id, false)),
  CHECK (NOT data ? 'gallery' OR jsonb_string_array(data -> 'gallery')),
  CHECK (
      jsonb_has_strings(data, ARRAY['id','origin','destination','boatName','departureTime','arrivalTime','fare','frequency','status','notes'])
      AND data ->> 'status' IN ('SCHEDULED','BOARDING','CANCELLED_SEA','ON_TIME','DELAYED')
  )
);

CREATE TABLE culture_items (
  id text PRIMARY KEY,
  data jsonb NOT NULL,
  CHECK (jsonb_typeof(data) = 'object' AND COALESCE(data ->> 'id' = id, false)),
  CHECK (NOT data ? 'gallery' OR jsonb_string_array(data -> 'gallery')),
  CHECK (
      jsonb_has_strings(data, ARRAY['id','title','category','description','detailText'])
  )
);

CREATE TABLE hiking_trails (
  id text PRIMARY KEY,
  data jsonb NOT NULL,
  CHECK (jsonb_typeof(data) = 'object' AND COALESCE(data ->> 'id' = id, false)),
  CHECK (NOT data ? 'gallery' OR jsonb_string_array(data -> 'gallery')),
  CHECK (
      jsonb_has_strings(data, ARRAY['id','name','category','difficulty','description','image'])
      AND jsonb_string_array(data -> 'highlights')
      AND COALESCE(jsonb_typeof(data -> 'coordinates') = 'array'
        AND jsonb_typeof(data -> 'waypoints') = 'array'
        AND jsonb_typeof(data -> 'elevationProfile') = 'array', false)
      AND NOT jsonb_path_exists(data, 'strict $.coordinates[*] ? (@.type() != "array" || @.size() != 2)')
      AND NOT jsonb_path_exists(data, '$.coordinates[*][*] ? (@.type() != "number")')
      AND NOT jsonb_path_exists(data, '$.waypoints[*] ? (@.type() != "object")')
      AND NOT jsonb_path_exists(data, '$.elevationProfile[*] ? (@.type() != "object")')
  )
);

INSERT INTO attractions(id, data) SELECT id, data FROM resources WHERE kind = 'attraction';
INSERT INTO accommodations(id, data) SELECT id, data FROM resources WHERE kind = 'accommodation';
INSERT INTO ferry_routes(id, data) SELECT id, data FROM resources WHERE kind = 'ferry';
INSERT INTO culture_items(id, data) SELECT id, data FROM resources WHERE kind = 'culture';
INSERT INTO hiking_trails(id, data) SELECT id, data FROM resources WHERE kind = 'trail';

ALTER TABLE bookings
  DROP CONSTRAINT bookings_accommodation_id_resource_kind_fkey,
  DROP COLUMN resource_kind,
  ADD CONSTRAINT bookings_accommodation_id_fkey
    FOREIGN KEY (accommodation_id) REFERENCES accommodations(id) ON DELETE RESTRICT;
CREATE INDEX bookings_accommodation_id_idx ON bookings(accommodation_id);

-- New reviews target attractions or accommodations. Migrate every historically
-- valid target kind, even if it could only have been written outside the API.
ALTER TABLE reviews ADD COLUMN target_kind text;
UPDATE reviews r SET target_kind = old.kind FROM resources old WHERE old.id = r.target_id;

ALTER TABLE reviews
  ALTER COLUMN target_kind SET NOT NULL,
  ADD CONSTRAINT reviews_target_kind_check
    CHECK (target_kind IN ('attraction', 'accommodation', 'ferry', 'culture', 'trail')),
  ADD COLUMN attraction_id text GENERATED ALWAYS AS
    (CASE WHEN target_kind = 'attraction' THEN target_id END) STORED
    REFERENCES attractions(id) ON DELETE RESTRICT,
  ADD COLUMN accommodation_id text GENERATED ALWAYS AS
    (CASE WHEN target_kind = 'accommodation' THEN target_id END) STORED
    REFERENCES accommodations(id) ON DELETE RESTRICT,
  ADD COLUMN ferry_id text GENERATED ALWAYS AS
    (CASE WHEN target_kind = 'ferry' THEN target_id END) STORED
    REFERENCES ferry_routes(id) ON DELETE RESTRICT,
  ADD COLUMN culture_id text GENERATED ALWAYS AS
    (CASE WHEN target_kind = 'culture' THEN target_id END) STORED
    REFERENCES culture_items(id) ON DELETE RESTRICT,
  ADD COLUMN trail_id text GENERATED ALWAYS AS
    (CASE WHEN target_kind = 'trail' THEN target_id END) STORED
    REFERENCES hiking_trails(id) ON DELETE RESTRICT,
  DROP CONSTRAINT reviews_target_id_fkey;

CREATE INDEX reviews_attraction_id_idx ON reviews(attraction_id) WHERE attraction_id IS NOT NULL;
CREATE INDEX reviews_accommodation_id_idx ON reviews(accommodation_id) WHERE accommodation_id IS NOT NULL;
CREATE INDEX reviews_ferry_id_idx ON reviews(ferry_id) WHERE ferry_id IS NOT NULL;
CREATE INDEX reviews_culture_id_idx ON reviews(culture_id) WHERE culture_id IS NOT NULL;
CREATE INDEX reviews_trail_id_idx ON reviews(trail_id) WHERE trail_id IS NOT NULL;

DROP TABLE resources;
