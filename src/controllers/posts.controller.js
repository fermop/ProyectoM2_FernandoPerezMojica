import {
  getAllPostsService,
  getPostByIdService,
  getPostsByAuthorService,
  createPostService,
  updatePostService,
  deletePostService
} from '#services/posts.service.js'

export async function getAllPostsController(req, res, next) {
  try {
    const posts = await getAllPostsService()
    return res.status(200).json({ status: 'success', data: posts })
  } catch (error) {
    next(error)
  }
}

export async function getPostByIdController(req, res, next) {
  try {
    const { id } = req.params
    const post = await getPostByIdService(id)
    return res.status(200).json({ status: 'success', data: post })
  } catch (error) {
    next(error)
  }
}

export async function getPostsByAuthorController(req, res, next) {
  try {
    const { authorId } = req.params
    const postsWithAuthor = await getPostsByAuthorService(authorId)
    return res.status(200).json({ status: 'success', data: postsWithAuthor })
  } catch (error) {
    next(error)
  }
}

export async function createPostController(req, res, next) {
  try {
    const newPost = await createPostService(req.body)
    return res.status(201).json({ status: 'success', data: newPost })
  } catch (error) {
    next(error)
  }
}

export async function updatePostController(req, res, next) {
  try {
    const { id } = req.params
    const updatedPost = await updatePostService(id, req.body)
    return res.status(200).json({ status: 'success', data: updatedPost })
  } catch (error) {
    next(error)
  }
}

export async function deletePostController(req, res, next) {
  try {
    const { id } = req.params
    const result = await deletePostService(id)
    return res.status(200).json({ status: 'success', message: result.message })
  } catch (error) {
    next(error)
  }
}