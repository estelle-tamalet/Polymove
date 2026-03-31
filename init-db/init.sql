CREATE TABLE IF NOT EXISTS students (
  id SERIAL PRIMARY KEY,
  firstname TEXT NOT NULL,
  name TEXT NOT NULL,
  domain TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS internships (
  id SERIAL PRIMARY KEY,
  student_id INT,
  offer_id TEXT,
  status TEXT,
  message TEXT
);

CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  student_id INT NOT NULL,
  type TEXT NOT NULL,
  offer_id TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id)
);

CREATE DATABASE IF NOT EXISTS polymove_laposte;
