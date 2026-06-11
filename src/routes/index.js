import { Router } from 'express'
import authorsRouter from '#routes/authors.routes.js'

const mainRouter = Router()

mainRouter.get('/health', (req, res) => {
  res.json({
    status: 'success',
    message: 'API activa y operando correctamente',
    timestamp: new Date()
  })
})

mainRouter.use('/authors', authorsRouter)

export default mainRouter