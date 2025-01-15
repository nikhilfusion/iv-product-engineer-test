create table gifs (
  id serial primary key,
  url text not null,
  category varchar(255) not null
);

create table user {
  id serial primary key,
  name text not null,
  email text not null,
  mobile number not null
}

create table point {
  id serial primary key,
  user_id number not null,
  point number not null
}