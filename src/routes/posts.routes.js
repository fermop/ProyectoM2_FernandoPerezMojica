import { Router } from 'express'
import {
  getAllPostsController,
  getPostByIdController,
  getPostsByAuthorController,
  createPostController,
  updatePostController,
  deletePostController
} from '#controllers/posts.controller.js'
import { validatePostMiddleware, validateIdMiddleware } from '#middlewares/validate.middleware.js'

const postsRouter = Router()

// GET /api/posts - listar posts
postsRouter.get('/', getAllPostsController)

// GET /api/posts/:id - detalle post
postsRouter.get('/:id', validateIdMiddleware, getPostByIdController)

// GET /api/posts/author/:authorId - posts con detalle de su author
postsRouter.get('/author/:authorId', (req, res, next) => {
  req.params.id = req.params.authorId
  next()
}, validateIdMiddleware, (req, res, next) => {
  req.params.authorId = req.params.id
  next()
}, getPostsByAuthorController)

// POST /api/posts - crear post
postsRouter.post('/', validatePostMiddleware, createPostController)

// PUT /api/posts/:id - actualizar post
postsRouter.put('/:id', validateIdMiddleware, validatePostMiddleware, updatePostController)

// DELETE /api/posts/:id - eliminar post
postsRouter.delete('/:id', validateIdMiddleware, deletePostController)

export default postsRouter