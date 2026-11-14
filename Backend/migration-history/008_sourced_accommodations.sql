-- Unknown facts are JSON null only for reference-only accommodation records.
ALTER TABLE resources DROP CONSTRAINT resources_check1;
ALTER TABLE resources ADD CONSTRAINT resources_check1 CHECK (CASE kind
    WHEN 'attraction' THEN
      jsonb_has_strings(data, ARRAY['id','name','category','image','description','locationName','entryFee','bestTime'])
      AND jsonb_string_array(data -> 'highlights')
      AND COALESCE(jsonb_typeof(data -> 'lat') = 'number' AND jsonb_typeof(data -> 'lng') = 'number', false)
    WHEN 'accommodation' THEN
      jsonb_has_strings(data, ARRAY['id','name','type','image','location','description','contactPhone'])
      AND jsonb_string_array(data -> 'amenities') AND jsonb_string_array(data -> 'roomTypes')
      AND (COALESCE(jsonb_typeof(data -> 'pricePerNight') = 'number' AND (data ->> 'pricePerNight')::numeric >= 0, false) OR COALESCE(data->>'bookingMode' = 'reference-only' AND data->'pricePerNight' = 'null'::jsonb, false))
      AND (COALESCE(jsonb_typeof(data -> 'maxGuests') = 'number' AND (data ->> 'maxGuests')::numeric >= 1, false) OR COALESCE(data->>'bookingMode' = 'reference-only' AND data->'maxGuests' = 'null'::jsonb, false))
      AND (COALESCE(jsonb_typeof(data -> 'coordinates') = 'object'
        AND jsonb_typeof(data #> '{coordinates,lat}') = 'number'
        AND jsonb_typeof(data #> '{coordinates,lng}') = 'number', false) OR COALESCE(data->>'bookingMode' = 'reference-only' AND data->'coordinates' = 'null'::jsonb, false))
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
-- Preserve referenced demo stays as unpublished history.
UPDATE resources SET data=data||'{"isArchived":true}'::jsonb WHERE kind='accommodation' AND id IN ('stay-bachawan-eco','stay-sibale-heritage','stay-dampali-cliff','stay-poblacion-inn');
WITH entries AS (SELECT value AS data FROM jsonb_array_elements($stays$[{"id":"stay-tdl-lodge","name":"TDL Lodge","type":"inn","image":"/assets/photo-unavailable.svg","pricePerNight":null,"rating":0,"reviewCount":0,"location":"Concepcion (Sibale), Romblon · exact address unconfirmed","amenities":[],"roomTypes":[],"maxGuests":null,"contactPhone":"","coordinates":null,"description":"A March 2019 firsthand travel report names TDL Lodge as a place to stay on Sibale Island. Current operation, address, facilities and rates have not been independently confirmed.","isVerifiedPartner":false,"bookingMode":"reference-only","evidenceLabel":"Documented in a 2019 travel report · current operation unconfirmed","verificationNote":"Confirm directly with the property or the municipality before making travel plans. No current public contact, room inventory or property photograph was verified.","sources":[{"title":"Sibalenhon Backpacker · Sibale Island, a hidden paradise of Romblon · 9 March 2019","url":"https://sibalenhonbackpacker.wordpress.com/2019/03/09/sibale-island-a-hidden-paradise-of-romblon/"}],"verifiedAt":"2026-10-26"},{"id":"stay-mimis-accommodation","name":"Mimi’s Accommodation","type":"homestay","image":"/assets/photo-unavailable.svg","pricePerNight":null,"rating":0,"reviewCount":0,"location":"Concepcion (Sibale), Romblon · exact address unconfirmed","amenities":[],"roomTypes":[],"maxGuests":null,"contactPhone":"","coordinates":null,"description":"Mimi’s Accommodation is named as lodging on Sibale Island in a March 2019 firsthand travel report. Current operation, address, facilities and rates have not been independently confirmed.","isVerifiedPartner":false,"bookingMode":"reference-only","evidenceLabel":"Documented in a 2019 travel report · current operation unconfirmed","verificationNote":"Confirm directly with the property or the municipality before making travel plans. No current public contact, room inventory or property photograph was verified.","sources":[{"title":"Sibalenhon Backpacker · Sibale Island, a hidden paradise of Romblon · 9 March 2019","url":"https://sibalenhonbackpacker.wordpress.com/2019/03/09/sibale-island-a-hidden-paradise-of-romblon/"}],"verifiedAt":"2026-10-26"}]$stays$::jsonb))
INSERT INTO resources(id,kind,data) SELECT data->>'id','accommodation',data FROM entries
ON CONFLICT(id) DO UPDATE SET data=excluded.data WHERE resources.kind='accommodation';
