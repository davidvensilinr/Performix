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
