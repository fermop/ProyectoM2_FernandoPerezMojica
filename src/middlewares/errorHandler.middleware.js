export default function errorHandlerMiddleware(err, req, res, next) {
  const statusCode = err.statusCode || 500
  
  console.error(`[Error]: ${err.message}`)

  return res.status(statusCode).json({
    status: 'error',
    message: err.message || 'Ocurrió un error inesperado en el servidor.',
    code: err.code || 'INTERNAL_SERVER_ERROR'
  })
}