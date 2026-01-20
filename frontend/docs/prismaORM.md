Prisma ORM - where ORM stands for Object Relational Mapping is a technique used to handle the data in a object oriented model instead of direct queries ensuring reliability, safety and better handling of data and its errors

Let's initialize prisma first

Step 1 : npm install prisma @prisma/client

step 2 : npx prisma init

Now let's import the database model from supabase :

Step 1: make sure to have the postgresql link in .env file

Step 2: npx prisma db pull-> pulls the schema of the tables and creates as models