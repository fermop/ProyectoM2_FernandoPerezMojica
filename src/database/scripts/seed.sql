TRUNCATE TABLE posts, authors RESTART IDENTITY CASCADE;

INSERT INTO authors (name, email, bio) VALUES
('Fernando Pérez', 'fernando@example.com', 'Full Stack Developer enfocado en arquitecturas limpias y seguras.'),
('Alan Turing', 'alan@turing.com', 'Padre de la ciencia de la computación y la inteligencia artificial.'),
('Grace Hopper', 'grace@hopper.org', 'Científica de la computación pionera en la programación de sistemas.');

INSERT INTO posts (title, content, author_id, published) VALUES
('Estructurando una API REST', 'Aprenderemos las mejores prácticas para modularizar Express en middlewares, controladores y servicios.', 1, false),
('Testing con Vitest y Supertest', 'El arte de asegurar la calidad del software mediante suites de integración orientadas por código de estado.', 1, true),
('La Máquina de Turing Universal', 'Ensayo teórico sobre los fundamentos lógicos del almacenamiento y procesamiento de datos.', 2, true),
('El Compilador A-0', 'El nacimiento del primer enrutador de lenguaje máquina a un lenguaje de alto nivel legible.', 3, true);