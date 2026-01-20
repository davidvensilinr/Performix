We are gonna use Supabase for database, authentication,storage and other features

We are gonna have organisation table for now to store the organisation details

Columns : 
1.id
2.name 
3.managed_by

Query for creating a organisation table in PostgreSQL :

create table organisation(
    id SERIAL PRIMARYKEY,
    name VARCHAR(1000) NOT NULL,
    managed_by VARCHAR(500) NOT NULL
)

incase if any table name has to be changed then the query that could be used
(
alter table organisation rename column created_by to managed_by
)

Now let's add some data to the table:
Query : INSERT INTO ORGANISATION (name,managed_by) VALUES ('Bazinga','Vijay')
