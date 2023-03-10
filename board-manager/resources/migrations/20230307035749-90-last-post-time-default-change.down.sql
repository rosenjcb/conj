alter table account
alter column last_reply set DEFAULT NOW();
--;;
alter table account 
alter column last_thread set DEFAULT NOW();
