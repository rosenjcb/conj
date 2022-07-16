create table if not exists board (
  id serial primary key,
  "name" varchar(32),
  "count" integer default 0
);
--;;
insert into board
("name")
VALUES
('random'),
('sports'),
('international'),
('technology'),
('anime')