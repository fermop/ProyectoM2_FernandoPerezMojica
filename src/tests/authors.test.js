import request from 'supertest'
import app from '#app'
import { localDatabase } from '#database/localDb.js'

describe('Pruebas de Integración - Recurso Autores (/authors)', () => {
  beforeEach(() => {
    localDatabase.authors = [
      {
        id: 1,
        name: "Fernando Pérez",
        email: "fernando@example.com",
        bio: "Full Stack Developer",
        created_at: new Date()
      }
    ]
    localDatabase.posts = []
  })

  describe('GET /api/authors', () => {
    it('200: Debería listar todos los autores', async () => {
      const response = await request(app)
        .get('/api/authors')
      
      expect(response.status).toBe(200)
      expect(response.body.status).toBe('success')
      expect(Array.isArray(response.body.data)).toBe(true)
      expect(response.body.data).toHaveLength(1)
      expect(response.body.data[0].name).toBe("Fernando Pérez")
    })
  })

  describe('GET /api/authors/:id', () => {
    it('200: Debería retornar el detalle de un autor existente por su ID', async () => {
      const response = await request(app)
        .get('/api/authors/1')

      expect(response.status).toBe(200)
      expect(response.body.status).toBe('success')
      expect(response.body.data.email).toBe("fernando@example.com")
    })

    it('400: Debería retornar error si el ID provisto en la URL no es un número', async () => {
      const response = await request(app)
        .get('/api/authors/abc')

      expect(response.status).toBe(400)
      expect(response.body.status).toBe('fail')
      expect(response.body.errors[0].field).toBe('id')
    })

    it('404: Debería retornar error si el ID es numérico pero no existe en el sistema', async () => {
      const response = await request(app)
        .get('/api/authors/999')

      expect(response.status).toBe(404)
      expect(response.body.status).toBe('error')
    })
  })

  describe('POST /api/authors', () => {
    it('201: Debería crear un autor exitosamente cuando los datos son correctos', async () => {
      const newAuthor = {
        name: "Alan Turing",
        email: "alan@turing.com",
        bio: "Padre de la computación"
      }

      const response = await request(app)
        .post('/api/authors')
        .send(newAuthor)

      expect(response.status).toBe(201)
      expect(response.body.status).toBe('success')
      expect(response.body.data).toHaveProperty('id')
      expect(response.body.data.id).toBe(2)
      expect(response.body.data.name).toBe("Alan Turing")
    })

    it('400: Debería acumular errores si faltan campos obligatorios (name, email)', async () => {
      const response = await request(app)
        .post('/api/authors')
        .send({}) // Cuerpo vacío

      expect(response.status).toBe(400)
      expect(response.body.status).toBe('fail')
      expect(response.body.errors.some(e => e.field === 'name')).toBe(true)
      expect(response.body.errors.some(e => e.field === 'email')).toBe(true)
    })

    it('400: Debería rebotar la petición si se inyectan caracteres especiales prohibidos', async () => {
      const corruptData = {
        name: "Brais; Moure",
        email: "brais<at>moure.com"
      }

      const response = await request(app)
        .post('/api/authors')
        .send(corruptData)

      expect(response.status).toBe(400)
      expect(response.body.status).toBe('fail')
      expect(response.body.errors.some(e => e.message.includes('caracteres especiales'))).toBe(true)
    })

    it('400: Debería rechazar si se envían campos extras no permitidos en la lista blanca', async () => {
      const hackData = {
        name: "Midu",
        email: "midu@example.com",
        role: "admin",
        id: 999,
        created_at: "2024-01-01T00:00:00Z"
      }

      const response = await request(app)
        .post('/api/authors')
        .send(hackData)

      expect(response.status).toBe(400)
      expect(response.body.status).toBe('fail')
      expect(response.body.errors[0].field).toBe('extra')
      expect(response.body.errors[0].message).toContain('Campos no permitidos en el cuerpo de la petición: role, id, created_at')
    })

    it('409: Debería rechazar la creación si el correo ya existe (Restricción UNIQUE)', async () => {
      const duplicateAuthor = {
        name: "Fernando Clon",
        email: "FERNANDO@example.com" // Probamos también el Case Insensitivity (.toLowerCase)
      }

      const response = await request(app)
        .post('/api/authors')
        .send(duplicateAuthor)

      expect(response.status).toBe(409)
      expect(response.body.status).toBe('error')
      expect(response.body.message).toContain('ya se encuentra registrado')
    })
  })

  describe('PUT /api/authors/:id', () => {
    it('200: Debería permitir una actualización parcial exitosa (ej. solo bio)', async () => {
      const response = await request(app)
        .put('/api/authors/1')
        .send({ bio: "Biografía actualizada" })

      expect(response.status).toBe(200)
      expect(response.body.status).toBe('success')
      expect(response.body.data.bio).toBe("Biografía actualizada")
      // Comprobar que preservó los datos anteriores que no mandamos
      expect(response.body.data.name).toBe("Fernando Pérez")
    })

    it('400: Debería rebotar si el cuerpo de la petición viene vacío ({})', async () => {
      const response = await request(app)
        .put('/api/authors/1')
        .send({})

      expect(response.status).toBe(400)
      expect(response.body.status).toBe('fail')
      expect(response.body.errors[0].field).toBe('body')
      expect(response.body.errors[0].message).toContain('Debe proporcionar al menos un campo válido para actualizar (name, email o bio).')
    })

    it('400: Debería rebotar si el ID en la URL no es numérico', async () => {
      const response = await request(app)
        .put('/api/authors/abc')
        .send({ bio: "Intento de actualización" })

      expect(response.status).toBe(400)
      expect(response.body.status).toBe('fail')
      expect(response.body.errors[0].field).toBe('id')
      expect(response.body.errors[0].message).toContain(`El ID provisto ('abc') debe ser un número válido.`)
    })

    it('400: Debería rebotar si el formato del correo parcial modificado es inválido', async () => {
      const response = await request(app)
        .put('/api/authors/1')
        .send({ email: "correoInvalido.com" })

      expect(response.status).toBe(400)
      expect(response.body.status).toBe('fail')
      expect(response.body.errors[0].field).toBe('email')
    })

    it('404: Debería retornar error si el ID es numérico pero no existe en el sistema', async () => {
      const response = await request(app)
        .put('/api/authors/999')
        .send({ bio: "Intento de actualización" })

      expect(response.status).toBe(404)
      expect(response.body.status).toBe('error')
    })

    it('409: Debería rebotar si el correo parcial modificado ya existe en otro autor (UNIQUE)', async () => {
      // Primero creamos un segundo autor para tener un email duplicado
      await request(app)
        .post('/api/authors')
        .send({
          name: "Ada Lovelace",
          email: "ada@example.com"
        })

      // Luego intentamos actualizar el correo de "Fernando Pérez" a uno que ya existe
      const response = await request(app)
        .put('/api/authors/1')
        .send({ email: "ada@example.com" })

      expect(response.status).toBe(409)
      expect(response.body.status).toBe('error')
    })
  })

  describe('DELETE /api/authors/:id', () => {
    it('200: Debería eliminar un autor existente y retornar un mensaje de éxito', async () => {
      const response = await request(app)
        .delete('/api/authors/1')

      expect(response.status).toBe(200)
      expect(response.body.status).toBe('success')
      
      // Comprobamos que efectivamente se borró pidiéndolo de nuevo
      const checkResponse = await request(app).get('/api/authors/1')
      expect(checkResponse.status).toBe(404)
    })

    it('400: Debería rebotar si el ID en la URL no es numérico', async () => {
      const response = await request(app)
        .delete('/api/authors/abc')

      expect(response.status).toBe(400)
      expect(response.body.status).toBe('fail')
      expect(response.body.errors[0].field).toBe('id')
      expect(response.body.errors[0].message).toContain(`El ID provisto ('abc') debe ser un número válido.`)
    })

    it('404: Debería rebotar al intentar eliminar un autor que no existe', async () => {
      const response = await request(app)
        .delete('/api/authors/999')

      expect(response.status).toBe(404)
      expect(response.body.status).toBe('error')
    })
  })
})