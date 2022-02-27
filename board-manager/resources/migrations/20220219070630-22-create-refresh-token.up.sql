create table if not exists refresh_token (
  account_id integer not null,
  expiry timestamp  not null,
  token text,
  valid boolean not null 
);
