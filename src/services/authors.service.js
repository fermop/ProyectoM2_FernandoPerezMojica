import { pool } from '#database/config.js'

export async function getAllAuthorsService() {
  const result = await pool.query('SELECT * FROM authors ORDER BY id ASC')
  return result.rows
}

export async function getAuthorByIdService(id) {
  const result = await pool.query('SELECT * FROM authors WHERE id = $1', [id])
  if (result.rows.length === 0) {
    const error = new Error(`No se encontró ningún autor con el ID: ${id}`)
    error.statusCode = 404
    throw error
  }
  return result.rows[0]
}

export async function createAuthorService({ name, email, bio }) {
  try {
    const result = await pool.query(
      'INSERT INTO authors (name, email, bio) VALUES ($1, $2, $3) RETURNING *',
      [name, email.toLowerCase(), bio || null]
    )
    return result.rows[0]
  } catch (error) {
    if (error.code === '23505') {
      const customError = new Error('El correo ya se encuentra registrado.')
      customError.statusCode = 409
      throw customError
    }
    throw error
  }
}

export async function updateAuthorService(id, { name, email, bio }) {
  const authorResult = await pool.query('SELECT * FROM authors WHERE id = $1', [id])
  if (authorResult.rows.length === 0) {
    const error = new Error(`No se encontró ningún autor con el ID: ${id}`)
    error.statusCode = 404
    throw error
  }
  const currentAuthor = authorResult.rows[0]
  const updatedName = name !== undefined ? name : currentAuthor.name
  const updatedEmail = email !== undefined ? email.toLowerCase() : currentAuthor.email
  const updatedBio = bio !== undefined ? bio : currentAuthor.bio

  try {
    const result = await pool.query(
      'UPDATE authors SET name = $1, email = $2, bio = $3 WHERE id = $4 RETURNING *',
      [updatedName, updatedEmail, updatedBio, id]
    )
    return result.rows[0]
  } catch (error) {
    if (error.code === '23505') {
      const customError = new Error('El correo ya se encuentra registrado por otro autor.')
      customError.statusCode = 409
      throw customError
    }
    throw error
  }
}

export async function deleteAuthorService(id) {
  const result = await pool.query('DELETE FROM authors WHERE id = $1', [id])
  if (result.rowCount === 0) {
    const error = new Error(`No se encontró ningún autor con el ID: ${id}`)
    error.statusCode = 404
    throw error
  }
  return { message: 'Autor y sus publicaciones eliminados correctamente.' }
}