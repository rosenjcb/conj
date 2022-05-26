alter table account
add column last_reply timestamp default now()
--;;
alter table account
add column last_thread timestamp default now()
