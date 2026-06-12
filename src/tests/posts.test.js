import request from 'supertest'
import app from '#app'
import { pool } from '#database/config.js'

describe('Pruebas de Integración: Recurso Publicaciones (/posts)', () => {
  beforeEach(async () => {
    await pool.query('TRUNCATE TABLE posts, authors RESTART IDENTITY CASCADE')
    await pool.query(
      'INSERT INTO authors (name, email, bio) VALUES ($1, $2, $3)',
      ['Fernando Pérez', 'fernando@example.com', 'Full Stack Developer']
    )
    await pool.query(
      'INSERT INTO posts (title, content, author_id, published) VALUES ($1, $2, $3, $4)',
      ['Estructurando una API REST', 'Contenido inicial de prueba', 1, true]
    )
  })

  afterAll(async () => {
    await pool.end()
  })

  describe('GET /api/posts', () => {
    it('200: Debería listar todas las publicaciones', async () => {
      const response = await request(app)
        .get('/api/posts')

      expect(response.status).toBe(200)
      expect(response.body.status).toBe('success')
      expect(Array.isArray(response.body.data)).toBe(true)
      expect(response.body.data).toHaveLength(1)
      expect(response.body.data[0].title).toBe("Estructurando una API REST")
    })
  })

  describe('GET /api/posts/:id', () => {
    it('200: Debería retornar el detalle de una publicación existente por su ID', async () => {
      const response = await request(app)
        .get('/api/posts/1')

      expect(response.status).toBe(200)
      expect(response.body.status).toBe('success')
      expect(response.body.data.title).toBe("Estructurando una API REST")
      expect(response.body.data.author_id).toBe(1)
    })

    it('400: Debería rebotar con error si el ID del parámetro en la URL no es numérico', async () => {
      const response = await request(app)
        .get('/api/posts/invalid-id')

      expect(response.status).toBe(400)
      expect(response.body.status).toBe('fail')
      expect(response.body.errors[0].field).toBe('id')
    })

    it('404: Debería retornar error si el ID es numérico pero no pertenece a ningún post', async () => {
      const response = await request(app)
        .get('/api/posts/999')

      expect(response.status).toBe(404)
      expect(response.body.status).toBe('error')
      expect(response.body.message).toContain('No se encontró ninguna publicación')
    })
  })

  describe('GET /api/posts/author/:authorId', () => {
    it('200: Debería retornar las publicaciones agrupadas bajo la estructura óptima del autor', async () => {
      const response = await request(app)
        .get('/api/posts/author/1')

      expect(response.status).toBe(200)
      expect(response.body.status).toBe('success')
      expect(Array.isArray(response.body.data)).toBe(true)
      expect(response.body.data).toHaveLength(1)
      
      const group = response.body.data[0]
      expect(group).toHaveProperty('author')
      expect(group.author.id).toBe(1)
      expect(group.author.name).toBe("Fernando Pérez")
      expect(Array.isArray(group.posts)).toBe(true)
      expect(group.posts).toHaveLength(1)
      expect(group.posts[0].title).toBe("Estructurando una API REST")
    })

    it('400: Debería fallar si el parámetro authorId de la URL no es un número', async () => {
      const response = await request(app)
        .get('/api/posts/author/abc')

      expect(response.status).toBe(400)
      expect(response.body.status).toBe('fail')
      expect(response.body.errors[0].field).toBe('id')
      expect(response.body.errors[0].message).toContain(`El ID provisto ('abc') debe ser un número válido.`)
    })

    it('404: Debería retornar error si el autor buscado no existe en el sistema', async () => {
      const response = await request(app)
        .get('/api/posts/author/999')

      expect(response.status).toBe(404)
      expect(response.body.status).toBe('error')
      expect(response.body.message).toContain('No se encontró ningún autor')
    })
  })

  describe('POST /api/posts', () => {
    it('201: Debería crear una publicación exitosamente con datos válidos', async () => {
      const validPost = {
        title: "Testing con Vitest",
        content: "Configurando entornos de pruebas de integración masivas",
        author_id: 1,
        published: false
      }

      const response = await request(app)
        .post('/api/posts')
        .send(validPost)

      expect(response.status).toBe(201)
      expect(response.body.status).toBe('success')
      expect(response.body.data.id).toBe(2)
      expect(response.body.data.title).toBe("Testing con Vitest")
      expect(response.body.data.published).toBe(false)
    })

    it('400: Debería retornar múltiples errores de formato si faltan propiedades requeridas', async () => {
      const response = await request(app)
        .post('/api/posts')
        .send({})

      expect(response.status).toBe(400)
      expect(response.body.status).toBe('fail')
      expect(response.body.errors.some(e => e.field === 'title')).toBe(true)
      expect(response.body.errors.some(e => e.field === 'content')).toBe(true)
      expect(response.body.errors.some(e => e.field === 'author_id')).toBe(true)
    })

    it('400: Debería rebotar la petición si los campos traen caracteres especiales prohibidos', async () => {
      const badPost = {
        title: "Post corrompido <script>",
        content: "Intento de inyección de código / XSS",
        author_id: 1
      }

      const response = await request(app)
        .post('/api/posts')
        .send(badPost)

      expect(response.status).toBe(400)
      expect(response.body.status).toBe('fail')
      expect(response.body.errors[0].message).toContain('caracteres especiales')
    })

    it('400: Debería rechazar si se inyectan campos extras ausentes en la lista blanca', async () => {
      const extraPost = {
        title: "Post Limpio",
        content: "Contenido Limpio",
        author_id: 1,
        likes: 1500,
        created_at: new Date(),
        role: "admin"
      }

      const response = await request(app)
        .post('/api/posts')
        .send(extraPost)

      expect(response.status).toBe(400)
      expect(response.body.status).toBe('fail')
      expect(response.body.errors[0].field).toBe('extra')
      expect(response.body.errors[0].message).toContain('Campos no permitidos en el cuerpo de la petición: likes, created_at, role')
    })

    it('400: Debería fallar si el author_id mapeado no pertenece a ningún autor real (Relación FK)', async () => {
      const ghostPost = {
        title: "Post de un fantasma",
        content: "Intentando romper la integridad relacional de la DB",
        author_id: 999
      }

      const response = await request(app)
        .post('/api/posts')
        .send(ghostPost)

      expect(response.status).toBe(400)
      expect(response.body.status).toBe('error')
      expect(response.body.message).toContain('El autor con ID 999 no existe')
    })
  })

  describe('PUT /api/posts/:id', () => {
    it('200: Debería permitir la modificación parcial de campos permitidos (title y/o published)', async () => {
      const response = await request(app)
        .put('/api/posts/1')
        .send({ title: "Título Cambiado", published: false })

      expect(response.status).toBe(200)
      expect(response.body.status).toBe('success')
      expect(response.body.data.title).toBe("Título Cambiado")
      expect(response.body.data.published).toBe(false)
      expect(response.body.data.content).toBe("Contenido inicial de prueba")
    })

    it('400: Debería rebotar si el cuerpo de la petición viene vacío ({})', async () => {
      const response = await request(app)
        .put('/api/posts/1')
        .send({})

      expect(response.status).toBe(400)
      expect(response.body.status).toBe('fail')
      expect(response.body.errors[0].field).toBe('body')
      expect(response.body.errors[0].message).toContain('Debe proporcionar al menos un campo válido para actualizar (title, content o published).')
    })

    it('400: Debería denegar la actualización si se intenta modificar el autor original', async () => {
      const response = await request(app)
        .put('/api/posts/1')
        .send({ author_id: 2, title: "Intento de cambio de autor" })

      expect(response.status).toBe(400)
      expect(response.body.status).toBe('fail')
      expect(response.body.errors[0].message).toContain('No está permitido modificar el autor original')
    })

    it('400: Debería rebotar si el ID del parámetro en la URL no es numérico', async () => {
      const response = await request(app)
        .put('/api/posts/abc')
        .send({ title: "Intento de actualización" })

      expect(response.status).toBe(400)
      expect(response.body.status).toBe('fail')
      expect(response.body.errors[0].field).toBe('id')
      expect(response.body.errors[0].message).toContain(`El ID provisto ('abc') debe ser un número válido.`)
    })

    it('404: Debería retornar error si el ID es numérico pero no pertenece a ningún post', async () => {
      const response = await request(app)
        .put('/api/posts/999')
        .send({ title: "Intento de actualización" })

      expect(response.status).toBe(404)
      expect(response.body.status).toBe('error')
      expect(response.body.message).toContain('No se encontró ninguna publicación')
    })
  })

  describe('DELETE /api/posts/:id', () => {
    it('200: Debería remover permanentemente una publicación existente del sistema', async () => {
      const response = await request(app)
        .delete('/api/posts/1')

      expect(response.status).toBe(200)
      expect(response.body.status).toBe('success')

      const check = await request(app).get('/api/posts/1')
      expect(check.status).toBe(404)
    })

    it('400: Debería rebotar si el ID del parámetro en la URL no es numérico', async () => {
      const response = await request(app)
        .delete('/api/posts/abc')

      expect(response.status).toBe(400)
      expect(response.body.status).toBe('fail')
      expect(response.body.errors[0].field).toBe('id')
    })

    it('404: Debería retornar error si el ID es numérico pero no pertenece a ningún post', async () => {
      const response = await request(app)
        .delete('/api/posts/999')

      expect(response.status).toBe(404)
      expect(response.body.status).toBe('error')
      expect(response.body.message).toContain('No se encontró ninguna publicación')
    })
  })
})