import { loadEnvFile } from 'node:process'
process.env.NODE_ENV !== 'production' && loadEnvFile('.env')
import express from 'express'
import mainRouter from '#routes/index.js'

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('/api/', mainRouter)

app.use((req, res) => {
  res.status(404).json({
    status: 'fail',
    message: `No se encontró la ruta ${req.originalUrl} en este servidor.`
  })
})

export default app