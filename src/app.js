import express from 'express'
import swaggerUi from 'swagger-ui-express'
import YAML from 'yamljs'
import mainRouter from '#routes/index.js'
import errorHandlerMiddleware from '#middlewares/errorHandler.middleware.js'

const swaggerDocument = YAML.load('./openapi.yaml')

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))

app.use('/api/', mainRouter)

app.use((req, res) => {
  res.status(404).json({
    status: 'fail',
    message: `No se encontró la ruta ${req.originalUrl} en este servidor.`
  })
})

app.use(errorHandlerMiddleware)

export default app