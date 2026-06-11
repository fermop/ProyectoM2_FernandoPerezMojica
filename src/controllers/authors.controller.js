import {
  getAllAuthorsService,
  getAuthorByIdService,
  createAuthorService,
  updateAuthorService,
  deleteAuthorService
} from '#services/authors.service.js'

export async function getAllAuthorsController(req, res, next) {
  try {
    const authors = await getAllAuthorsService()
    return res.status(200).json({ status: 'success', data: authors })
  } catch (error) {
    next(error)
  }
}

export async function getAuthorByIdController(req, res, next) {
  try {
    const { id } = req.params
    const author = await getAuthorByIdService(id)
    return res.status(200).json({ status: 'success', data: author })
  } catch (error) {
    next(error)
  }
}

export async function createAuthorController(req, res, next) {
  try {
    const newAuthor = await createAuthorService(req.body)
    return res.status(201).json({ status: 'success', data: newAuthor })
  } catch (error) {
    next(error)
  }
}

export async function updateAuthorController(req, res, next) {
  try {
    const { id } = req.params
    const updatedAuthor = await updateAuthorService(id, req.body)
    return res.status(200).json({ status: 'success', data: updatedAuthor })
  } catch (error) {
    next(error)
  }
}

export async function deleteAuthorController(req, res, next) {
  try {
    const { id } = req.params
    const result = await deleteAuthorService(id)
    return res.status(200).json({ status: 'success', message: result.message })
  } catch (error) {
    next(error)
  }
}