import { Router } from 'express'

const mainRouter = Router()

mainRouter.get('/health', (req, res) => {
  res.json({
    status: 'success',
    message: 'API activa y operando correctamente',
    timestamp: new Date()
  })
})

export default mainRouter