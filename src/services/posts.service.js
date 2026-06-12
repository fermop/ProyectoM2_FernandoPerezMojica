import { localDatabase } from '#database/localDb.js'

export async function getAllPostsService() {
  return localDatabase.posts
}

export async function getPostByIdService(id) {
  const post = localDatabase.posts.find(p => p.id === Number(id))
  if (!post) {
    const error = new Error(`No se encontró ninguna publicación con el ID: ${id}`)
    error.statusCode = 404
    throw error
  }
  return post
}

export async function getPostsByAuthorService(authorId) {
  // Verificar si el autor existe
  const author = localDatabase.authors.find(auth => auth.id === Number(authorId))
  if (!author) {
    const error = new Error(`No se encontró ningún autor con el ID: ${authorId}`)
    error.statusCode = 404
    throw error
  }

  // Filtrar los posts de ese autor e inyectar el detalle de su autor
  const authorPosts = localDatabase.posts.filter(p => p.author_id === Number(authorId))
  
  return authorPosts.map(post => ({
    ...post,
    author: {
      id: author.id,
      name: author.name,
      email: author.email
    }
  }))
}

export async function createPostService({ title, content, author_id, published }) {
  // Simular la restricción FOREIGN KEY: Verificar si el autor existe
  const authorExists = localDatabase.authors.some(auth => auth.id === Number(author_id))
  if (!authorExists) {
    const error = new Error(`No se puede crear la publicación. El autor con ID ${author_id} no existe.`)
    error.statusCode = 400
    throw error
  }

  const newPost = {
    id: localDatabase.posts.length > 0 ? Math.max(...localDatabase.posts.map(p => p.id)) + 1 : 1,
    title,
    content,
    author_id: Number(author_id),
    published: published !== undefined ? published : true,
    created_at: new Date()
  }

  localDatabase.posts.push(newPost)
  return newPost
}

export async function updatePostService(id, { title, content, published }) {
  const postIndex = localDatabase.posts.findIndex(p => p.id === Number(id))
  if (postIndex === -1) {
    const error = new Error(`No se encontró ninguna publicación con el ID: ${id}`)
    error.statusCode = 404
    throw error
  }

  const currentPost = localDatabase.posts[postIndex]
  const updatedPost = {
    ...currentPost,
    title: title !== undefined ? title : currentPost.title,
    content: content !== undefined ? content : currentPost.content,
    published: published !== undefined ? published : currentPost.published
  }

  localDatabase.posts[postIndex] = updatedPost
  return updatedPost
}

export async function deletePostService(id) {
  const postIndex = localDatabase.posts.findIndex(p => p.id === Number(id))
  if (postIndex === -1) {
    const error = new Error(`No se encontró ninguna publicación con el ID: ${id}`)
    error.statusCode = 404
    throw error
  }

  localDatabase.posts.splice(postIndex, 1)
  return { message: "Publicación eliminada correctamente." }
}