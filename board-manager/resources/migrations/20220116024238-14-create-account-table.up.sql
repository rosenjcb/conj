create table if not exists account (
  id serial primary key,
  email text not null unique,
  pass text not null
);
