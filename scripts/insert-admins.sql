INSERT INTO users (name, email, password, role) 
VALUES 
  ('Admin Huan 1', 'admin1@learn.com', '$2b$10$FeTLMaIpYJxbYxCINQkOJuBI8hx9BihWd/0HwcIlsS5I.PK5f.i9m', 'ADMIN'), 
  ('Admin Huan 2', 'admin2@learn.com', '$2b$10$FeTLMaIpYJxbYxCINQkOJuBI8hx9BihWd/0HwcIlsS5I.PK5f.i9m', 'ADMIN') 
ON CONFLICT (email) DO UPDATE SET role = 'ADMIN', password = EXCLUDED.password;
