import app from '#app'

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log(`===========================================`)
  console.log(`Servidor Express ejecutándose en el puerto: ${PORT}`)
  process.env.NODE_ENV === 'development' && console.log(`Modo Desarrollo: http://localhost:${PORT}/api/health`)
  console.log(`===========================================`)
})