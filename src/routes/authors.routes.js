import { Router } from 'express'
import {
  getAllAuthorsController,
  getAuthorByIdController,
  createAuthorController,
  updateAuthorController,
  deleteAuthorController
} from '#controllers/authors.controller.js'
import { validateAuthorMiddleware } from '#middlewares/validate.middleware.js'

const authorsRouter = Router()

// GET /api/authors - Listar usuarios
authorsRouter.get('/', getAllAuthorsController)

// GET /api/authors/:id - Detalle de usuario
authorsRouter.get('/:id', getAuthorByIdController)

// POST /api/authors - Crear usuario
authorsRouter.post('/', validateAuthorMiddleware, createAuthorController)

// PUT /api/authors/:id - Actualizar usuario
authorsRouter.put('/:id', validateAuthorMiddleware, updateAuthorController)

// DELETE /api/authors/:id - Eliminar usuario
authorsRouter.delete('/:id', deleteAuthorController)

export default authorsRouter