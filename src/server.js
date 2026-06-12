import app from '#app'
import { pool } from '#database/config.js'

const PORT = process.env.PORT || 3000

const server = app.listen(PORT, () => {
  console.log(`===========================================`)
  console.log(`Servidor Express ejecutándose en el puerto: ${PORT}`)
  process.env.NODE_ENV === 'development' && console.log(`Modo Desarrollo: http://localhost:${PORT}/api/health`)
  console.log(`===========================================`)
})

const gracefulShutdown = async (signal) => {
  console.log(`\nRecibida señal ${signal}. Iniciando apagado gracioso...`)
  server.close(async () => {
    console.log('Servidor HTTP Express cerrado.')
    try {
      await pool.end()
      console.log('Pool de conexiones de base de datos finalizado.')
      process.exit(0)
    } catch (err) {
      console.error('Error al cerrar el pool de conexiones:', err)
      process.exit(1)
    }
  })
}

process.on('SIGINT', () => gracefulShutdown('SIGINT'))
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))