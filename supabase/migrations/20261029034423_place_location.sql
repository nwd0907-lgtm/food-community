-- 맛집 위치(PRD: 주소 입력창 · 지도 기능). 기존 글에는 위치가 없어 nullable, 대신 셋은 함께 있거나 함께 없다
-- 좌표는 WGS84 위도·경도. 앱은 등록·수정 시 위치를 필수로 받는다
alter table public.place
  add column address text,
  add column latitude double precision,
  add column longitude double precision,
  add constraint place_location_all_or_none check (
    (address is null and latitude is null and longitude is null)
    or (address is not null and latitude is not null and longitude is not null)
  ),
  add constraint place_address_length check (address is null or char_length(btrim(address)) between 1 and 200),
  add constraint place_latitude_range check (latitude is null or latitude between -90 and 90),
  add constraint place_longitude_range check (longitude is null or longitude between -180 and 180);
