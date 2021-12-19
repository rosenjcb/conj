create table counter (
  id serial primary key,
  board varchar(32),
  count integer default 0
);

INSERT into counter 
(board)
VALUES
('random')
