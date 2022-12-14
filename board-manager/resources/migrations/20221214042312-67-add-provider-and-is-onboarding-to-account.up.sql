alter table account
add column "provider" varchar(16);
--;;
alter table account
add column is_onboarding boolean default false;