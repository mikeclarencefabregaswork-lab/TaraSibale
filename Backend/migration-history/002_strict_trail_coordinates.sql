-- Lax JSONPath implicitly unwraps coordinate pairs during size evaluation.
-- Strict mode checks each [latitude, longitude] array without unwrapping it.
ALTER TABLE resources DROP CONSTRAINT resources_check1;
ALTER TABLE resources ADD CONSTRAINT resources_check1 CHECK (CASE kind
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
      AND NOT jsonb_path_exists(data, 'strict $.coordinates[*] ? (@.type() != "array" || @.size() != 2)')
      AND NOT jsonb_path_exists(data, '$.coordinates[*][*] ? (@.type() != "number")')
      AND NOT jsonb_path_exists(data, '$.waypoints[*] ? (@.type() != "object")')
      AND NOT jsonb_path_exists(data, '$.elevationProfile[*] ? (@.type() != "object")')
    ELSE false END);
