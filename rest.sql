
CREATE TABLE restaurant (

  id SERIAL NOT NULL PRIMARY KEY,

  name VARCHAR,

  address VARCHAR,

  category VARCHAR

);



--



CREATE TABLE reviewer (

  id SERIAL NOT NULL PRIMARY KEY,

  name VARCHAR,

  email VARCHAR (50) UNIQUE,

  karma INTEGER CHECK(karma >= 0 AND karma <= 7),

  password VARCHAR

);

--

CREATE TABLE review (

  id SERIAL NOT NULL PRIMARY KEY,

  reviewer_id INTEGER REFERENCES reviewer(id),

  stars INTEGER CHECK(stars >= 1 AND stars <= 5),

  title VARCHAR,

  review VARCHAR,

  restaurant_id INTEGER REFERENCES restaurant(id)

);
