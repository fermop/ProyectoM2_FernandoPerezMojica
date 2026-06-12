import { pool } from '#database/config.js'

export async function getAllPostsService() {
  const result = await pool.query('SELECT * FROM posts ORDER BY id ASC')
  return result.rows
}

export async function getPostByIdService(id) {
  const result = await pool.query('SELECT * FROM posts WHERE id = $1', [id])
  if (result.rows.length === 0) {
    const error = new Error(`No se encontró ninguna publicación con el ID: ${id}`)
    error.statusCode = 404
    throw error
  }
  return result.rows[0]
}

export async function getPostsByAuthorService(authorId) {
  const authorResult = await pool.query('SELECT id, name, email FROM authors WHERE id = $1', [authorId])
  if (authorResult.rows.length === 0) {
    const error = new Error(`No se encontró ningún autor con el ID: ${authorId}`)
    error.statusCode = 404
    throw error
  }
  const author = authorResult.rows[0]

  const postsResult = await pool.query(
    'SELECT id, title, content, published, created_at FROM posts WHERE author_id = $1 ORDER BY id ASC',
    [authorId]
  )

  return [
    {
      author,
      posts: postsResult.rows
    }
  ]
}

export async function createPostService({ title, content, author_id, published }) {
  try {
    const result = await pool.query(
      'INSERT INTO posts (title, content, author_id, published) VALUES ($1, $2, $3, $4) RETURNING *',
      [title, content, Number(author_id), published !== undefined ? published : true]
    )
    return result.rows[0]
  } catch (error) {
    if (error.code === '23503') {
      const customError = new Error(`No se puede crear la publicación. El autor con ID ${author_id} no existe.`)
      customError.statusCode = 400
      throw customError
    }
    throw error
  }
}

export async function updatePostService(id, { title, content, published }) {
  const postResult = await pool.query('SELECT * FROM posts WHERE id = $1', [id])
  if (postResult.rows.length === 0) {
    const error = new Error(`No se encontró ninguna publicación con el ID: ${id}`)
    error.statusCode = 404
    throw error
  }
  const currentPost = postResult.rows[0]
  const updatedTitle = title !== undefined ? title : currentPost.title
  const updatedContent = content !== undefined ? content : currentPost.content
  const updatedPublished = published !== undefined ? published : currentPost.published

  const result = await pool.query(
    'UPDATE posts SET title = $1, content = $2, published = $3 WHERE id = $4 RETURNING *',
    [updatedTitle, updatedContent, updatedPublished, id]
  )
  return result.rows[0]
}

export async function deletePostService(id) {
  const result = await pool.query('DELETE FROM posts WHERE id = $1', [id])
  if (result.rowCount === 0) {
    const error = new Error(`No se encontró ninguna publicación con el ID: ${id}`)
    error.statusCode = 404
    throw error
  }
  return { message: 'Publicación eliminada correctamente.' }
}