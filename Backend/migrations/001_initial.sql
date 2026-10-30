-- Executed inside the migration runner's transaction; do not add BEGIN/COMMIT.
CREATE TABLE users (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  email text NOT NULL CHECK (length(btrim(email)) BETWEEN 3 AND 320),
  name text NOT NULL CHECK (length(btrim(name)) BETWEEN 1 AND 120),
  password_hash text NOT NULL CHECK (length(password_hash) > 0),
  role text NOT NULL CHECK (role IN ('traveler', 'resident', 'guide', 'host', 'admin')),
  is_verified boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX users_email_lower_unique ON users (lower(email));

CREATE TABLE sessions (
  token_hash text PRIMARY KEY,
  user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at timestamptz NOT NULL
);
CREATE INDEX sessions_user_id_idx ON sessions(user_id);
CREATE INDEX sessions_expires_at_idx ON sessions(expires_at);

-- Helpers make missing keys fail explicitly rather than pass SQL CHECK via NULL.
CREATE FUNCTION jsonb_has_strings(value jsonb, keys text[]) RETURNS boolean
LANGUAGE sql IMMUTABLE STRICT PARALLEL SAFE AS $$
  SELECT bool_and(COALESCE(jsonb_typeof(value -> key) = 'string', false))
  FROM unnest(keys) AS key
$$;
CREATE FUNCTION jsonb_string_array(value jsonb) RETURNS boolean
LANGUAGE sql IMMUTABLE PARALLEL SAFE AS $$
  SELECT COALESCE(jsonb_typeof(value) = 'array'
    AND NOT jsonb_path_exists(value, '$[*] ? (@.type() != "string")'), false)
$$;

CREATE TABLE resources (
  id text PRIMARY KEY,
  kind text NOT NULL CHECK (kind IN ('attraction', 'accommodation', 'ferry', 'culture', 'trail')),
  data jsonb NOT NULL,
  UNIQUE(id, kind),
  CHECK (jsonb_typeof(data) = 'object' AND COALESCE(data ->> 'id' = id, false)),
  CHECK (CASE kind
    WHEN 'attraction' THEN
      jsonb_has_strings(data, ARRAY['id','name','category','image','description','locationName','entryFee','bestTime'])
      AND jsonb_string_array(data -> 'highlights')
      AND COALESCE(jsonb_typeof(data -> 'lat') = 'number' AND jsonb_typeof(data -> 'lng') = 'number', false)
    WHEN 'accommodation' THEN
      jsonb_has_strings(data, ARRAY['id','name','type','image','location','description','contactPhone'])
      AND jsonb_string_array(data -> 'amenities') AND jsonb_string_array(data -> 'roomTypes')
      AND COALESCE(jsonb_typeof(data -> 'pricePerNight') = 'number' AND (data ->> 'pricePerNight')::numeric >= 0, false)
      AND COALESCE(jsonb_typeof(data -> 'maxGuests') = 'number' AND (data ->> 'maxGuests')::numeric >= 1, false)
      AND COALESCE(jsonb_typeof(data -> 'coordinates') = 'object'
        AND jsonb_typeof(data #> '{coordinates,lat}') = 'number'
        AND jsonb_typeof(data #> '{coordinates,lng}') = 'number', false)
    WHEN 'ferry' THEN
      jsonb_has_strings(data, ARRAY['id','origin','destination','boatName','departureTime','arrivalTime','fare','frequency','status','notes'])
      AND data ->> 'status' IN ('SCHEDULED','BOARDING','CANCELLED_SEA','ON_TIME','DELAYED')
    WHEN 'culture' THEN
      jsonb_has_strings(data, ARRAY['id','title','category','description','detailText'])
    WHEN 'trail' THEN
      jsonb_has_strings(data, ARRAY['id','name','category','difficulty','description','image'])
      AND jsonb_string_array(data -> 'highlights')
      AND COALESCE(jsonb_typeof(data -> 'coordinates') = 'array'
        AND jsonb_typeof(data -> 'waypoints') = 'array'
        AND jsonb_typeof(data -> 'elevationProfile') = 'array', false)
      AND NOT jsonb_path_exists(data, '$.coordinates[*] ? (@.type() != "array" || @.size() != 2)')
      AND NOT jsonb_path_exists(data, '$.coordinates[*][*] ? (@.type() != "number")')
      AND NOT jsonb_path_exists(data, '$.waypoints[*] ? (@.type() != "object")')
      AND NOT jsonb_path_exists(data, '$.elevationProfile[*] ? (@.type() != "object")')
    ELSE false END),
  CHECK (NOT data ? 'gallery' OR jsonb_string_array(data -> 'gallery'))
);
CREATE INDEX resources_kind_idx ON resources(kind);

CREATE TABLE settings (
  key text PRIMARY KEY,
  data jsonb NOT NULL CHECK (jsonb_typeof(data) = 'object'),
  CHECK (key <> 'permissions' OR (
    data ?& ARRAY['enableGroupChat','enableHomestayBooking','enableCloudVault','enablePublicReviews',
      'enableSocialCommunityStream','enableAiConcierge','allowOnlyVerifiedGuidesToMessage',
      'allowOnlyVerifiedHostsToAcceptBookings','requireLoginForReviews','maintenanceMode']
    AND NOT jsonb_path_exists(data, '$.* ? (@.type() != "boolean")')
  ))
);

CREATE TABLE reviews (
  id text PRIMARY KEY,
  target_id text NOT NULL REFERENCES resources(id) ON DELETE RESTRICT,
  user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  data jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (jsonb_typeof(data) = 'object' AND jsonb_has_strings(data, ARRAY['id','targetId','comment'])),
  CHECK (COALESCE(data ->> 'id' = id AND data ->> 'targetId' = target_id, false)),
  CHECK (COALESCE(jsonb_typeof(data -> 'rating') = 'number'
    AND (data ->> 'rating')::numeric BETWEEN 1 AND 5
    AND (data ->> 'rating')::numeric = trunc((data ->> 'rating')::numeric), false)),
  CHECK (length(btrim(data ->> 'comment')) BETWEEN 1 AND 4000),
  CHECK (NOT data ? 'tags' OR jsonb_string_array(data -> 'tags'))
);
CREATE INDEX reviews_target_created_idx ON reviews(target_id, created_at DESC);
CREATE INDEX reviews_user_id_idx ON reviews(user_id);
CREATE TABLE review_votes (
  review_id text NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  PRIMARY KEY(review_id, user_id)
);
CREATE INDEX review_votes_user_id_idx ON review_votes(user_id);

CREATE TABLE bookings (
  id text PRIMARY KEY,
  user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  accommodation_id text NOT NULL,
  resource_kind text NOT NULL DEFAULT 'accommodation' CHECK (resource_kind = 'accommodation'),
  check_in date NOT NULL,
  check_out date NOT NULL,
  guests_count integer NOT NULL CHECK (guests_count > 0),
  room_type text NOT NULL CHECK (length(btrim(room_type)) > 0),
  total_amount numeric(12,2) NOT NULL CHECK (total_amount >= 0),
  status text NOT NULL CHECK (status IN ('CONFIRMED','PENDING','CANCELLED')),
  data jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY(accommodation_id, resource_kind) REFERENCES resources(id, kind) ON DELETE RESTRICT,
  CHECK (check_out > check_in),
  CHECK (jsonb_typeof(data) = 'object' AND COALESCE(data ->> 'id' = id
    AND data ->> 'accommodationId' = accommodation_id, false))
);
CREATE INDEX bookings_user_created_idx ON bookings(user_id, created_at DESC);
CREATE INDEX bookings_inventory_idx ON bookings(accommodation_id, check_in, check_out)
  WHERE status IN ('CONFIRMED','PENDING');

CREATE TABLE travel_groups (id text PRIMARY KEY, name text NOT NULL);
CREATE TABLE group_members (
  group_id text NOT NULL REFERENCES travel_groups(id) ON DELETE CASCADE,
  user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  PRIMARY KEY(group_id, user_id)
);
CREATE INDEX group_members_user_id_idx ON group_members(user_id);
CREATE TABLE messages (
  id text PRIMARY KEY,
  group_id text NOT NULL REFERENCES travel_groups(id) ON DELETE CASCADE,
  user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  data jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (jsonb_typeof(data) = 'object' AND jsonb_has_strings(data, ARRAY['id','groupId','text'])),
  CHECK (COALESCE(data ->> 'id' = id AND data ->> 'groupId' = group_id, false)),
  CHECK (length(btrim(data ->> 'text')) BETWEEN 1 AND 4000)
);
CREATE INDEX messages_group_created_idx ON messages(group_id, created_at);
CREATE INDEX messages_user_id_idx ON messages(user_id);

CREATE TABLE social_posts (
  id text PRIMARY KEY,
  user_id text REFERENCES users(id) ON DELETE SET NULL,
  data jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (jsonb_typeof(data) = 'object' AND jsonb_has_strings(data, ARRAY['id','caption'])),
  CHECK (COALESCE(data ->> 'id' = id, false)),
  CHECK (length(btrim(data ->> 'caption')) BETWEEN 1 AND 4000)
);
CREATE INDEX social_posts_created_idx ON social_posts(created_at DESC);
CREATE INDEX social_posts_user_id_idx ON social_posts(user_id);
CREATE TABLE social_likes (
  post_id text NOT NULL REFERENCES social_posts(id) ON DELETE CASCADE,
  user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  PRIMARY KEY(post_id, user_id)
);
CREATE INDEX social_likes_user_id_idx ON social_likes(user_id);

CREATE TABLE verifications (
  id text PRIMARY KEY,
  user_id text REFERENCES users(id) ON DELETE SET NULL,
  data jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (jsonb_typeof(data) = 'object' AND jsonb_has_strings(data, ARRAY['id','fullName','email','appliedRole','status'])),
  CHECK (COALESCE(data ->> 'id' = id, false)),
  CHECK (data ->> 'appliedRole' IN ('host','guide','resident')),
  CHECK (data ->> 'status' IN ('PENDING','APPROVED','REJECTED')),
  CHECK (user_id IS NULL OR NOT data ? 'userId' OR COALESCE(data ->> 'userId' = user_id, false))
);
CREATE INDEX verifications_user_id_idx ON verifications(user_id);

CREATE TABLE user_state (
  user_id text PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  notifications jsonb NOT NULL DEFAULT '[]' CHECK (jsonb_typeof(notifications) = 'array'),
  documents jsonb NOT NULL DEFAULT '[]' CHECK (jsonb_typeof(documents) = 'array'),
  itinerary jsonb NOT NULL DEFAULT '[]' CHECK (jsonb_typeof(itinerary) = 'array'),
  checklists jsonb NOT NULL DEFAULT '{}' CHECK (jsonb_typeof(checklists) = 'object'),
  updated_at timestamptz NOT NULL DEFAULT now()
);
