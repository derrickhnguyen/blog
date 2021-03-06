CREATE TABLE User (
  email VARCHAR(255) UNIQUE NOT NULL,
  facebookId VARCHAR(255) UNIQUE NOT NULL,
  firstName VARCHAR(255) NOT NULL,
  lastName VARCHAR(255) NOT NULL,
  id VARCHAR(128) PRIMARY KEY NOT NULL
);
CREATE TABLE Post (
  authorId VARCHAR(128) NOT NULL,
  content TEXT,
  createdAt TIMESTAMP NOT NULL DEFAULT now(),
  id VARCHAR(128) PRIMARY KEY NOT NULL,
  published BOOLEAN NOT NULL DEFAULT false,
  title TINYTEXT,
  updatedAt TIMESTAMP,
  headerImageUrl TEXT,

  FOREIGN KEY (authorId) REFERENCES User(id)
);
CREATE TABLE Profile (
  bio TINYTEXT,
  profileImageUrl TEXT,
  id VARCHAR(128) PRIMARY KEY NOT NULL,
  userId VARCHAR(128) NOT NULL,
  instagramUrl TEXT,
  facebookUrl TEXT,
  twitterUrl TEXT,

  FOREIGN KEY (userId) REFERENCES User(id)
)