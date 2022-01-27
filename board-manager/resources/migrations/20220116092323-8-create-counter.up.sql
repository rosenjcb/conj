create table if not exists counter (
  id serial primary key,
  board varchar(32),
  count integer default 0
);
