alter table account
alter column last_reply set DEFAULT NOW() - INTERVAL '1 minutes';
--;;
alter table account 
alter column last_thread set DEFAULT NOW() - INTERVAL '5 minute';
