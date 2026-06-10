import { localDatabase } from '#database/localDb.js'

async function getAllAuthorsService() {
  return localDatabase.authors
}

async function getAuthorByIdService(id) {
  const author = localDatabase.authors.find(auth => auth.id === Number(id))
  if (!author) {
    const error = new Error(`No se encontró ningún autor con el ID: ${id}`)
    error.statusCode = 404
    throw error
  }
  return author
}

async function createAuthorService({ name, email, bio }) {
  // Simular la restricción UNIQUE del esquema
  const emailExists = localDatabase.authors.some(auth => auth.email.toLowerCase() === email.toLowerCase())
  if (emailExists) {
    const error = new Error("El correo ya se encuentra registrado.")
    error.code = '23505'
    error.statusCode = 400
    throw error
  }

  const newAuthor = {
    id: localDatabase.authors.length > 0 ? Math.max(...localDatabase.authors.map(a => a.id)) + 1 : 1,
    name,
    email,
    bio: bio || null,
    created_at: new Date()
  }

  localDatabase.authors.push(newAuthor)
  return newAuthor
}

async function updateAuthorService(id, { name, email, bio }) {
  const authorIndex = localDatabase.authors.findIndex(auth => auth.id === Number(id))
  if (authorIndex === -1) {
    const error = new Error(`No se encontró ningún autor con el ID: ${id}`)
    error.statusCode = 404
    throw error
  }

  // Verificar si el nuevo email está siendo usado por OTRO autor diferente
  if (email) {
    const emailExists = localDatabase.authors.some(
      auth => auth.email.toLowerCase() === email.toLowerCase() && auth.id !== Number(id)
    )
    if (emailExists) {
      const error = new Error("El correo ya se encuentra registrado por otro autor.")
      error.code = '23505'
      error.statusCode = 400
      throw error
    }
  }

  // Actualizamos los campos presentes manteniendo los anteriores si no se envían
  const currentAuthor = localDatabase.authors[authorIndex]
  const updatedAuthor = {
    ...currentAuthor,
    name: name !== undefined ? name : currentAuthor.name,
    email: email !== undefined ? email : currentAuthor.email,
    bio: bio !== undefined ? bio : currentAuthor.bio
  }

  localDatabase.authors[authorIndex] = updatedAuthor
  return updatedAuthor
}

async function deleteAuthorService(id) {
  const authorIndex = localDatabase.authors.findIndex(auth => auth.id === Number(id))
  if (authorIndex === -1) {
    const error = new Error(`No se encontró ningún autor con el ID: ${id}`)
    error.statusCode = 404
    throw error
  }

  // ON DELETE CASCADE simulado: Al borrar el autor, eliminamos también sus posts
  localDatabase.posts = localDatabase.posts.filter(post => post.author_id !== Number(id))
  
  // Borramos el autor
  localDatabase.authors.splice(authorIndex, 1)
  return { message: "Autor y sus publicaciones eliminados correctamente." }
}

export default {
  getAllAuthorsService,
  getAuthorByIdService,
  createAuthorService,
  updateAuthorService,
  deleteAuthorService
}