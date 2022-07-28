alter table account
add column username varchar(16) unique not null default substring(md5(random()::text), 0, 15);