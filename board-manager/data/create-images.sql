create table images (
  id serial primary key,
  name varchar(32),
  location varchar(128) 
);

INSERT into images 
(name, location)
VALUES
('fake-smirk-pepe', 'https://rare-pepe.com/wp-content/uploads/0524_-_v8nbzHG.jpg'),
('israeli-hood-pepe', 'https://rare-pepe.com/wp-content/uploads/0137_-_Zop4l9B.png'),
('mixtape-pepe', 'https://rare-pepe.com/wp-content/uploads/0462_-_LOggytP.jpg');