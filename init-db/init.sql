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

INSERT INTO students (firstname, name, domain) VALUES
  ('Jean', 'Dupont', 'Computer Science'),
  ('Marie', 'Martin', 'Engineering'),
  ('Pierre', 'Lefevre', 'Data Science')
ON CONFLICT DO NOTHING;

