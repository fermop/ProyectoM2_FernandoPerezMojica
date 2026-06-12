import { 
  validateName,
  validateEmailStructure,
  validateBio,
  validatePostTitle,
  validatePostContent
} from '#utils/validators.js'

/**
 * Middleware para validar que el parámetro ID de la URL sea estrictamente numérico
 */
export function validateIdMiddleware(req, res, next) {
  const { id } = req.params

  if (id !== undefined && !/^\d+$/.test(id)) {
    return res.status(400).json({
      status: 'fail',
      message: 'Errores de validación en los parámetros de la petición.',
      errors: [
        {
          field: 'id',
          message: `El ID provisto ('${id}') debe ser un número válido.`
        }
      ]
    })
  }

  next()
}

/**
 * Middleware para validar las propiedades del body de un Autor
 */
export function validateAuthorMiddleware(req, res, next) {
  const errors = []
  const { name, email, bio } = req.body

  // Protección de campos extra (Whitelisting)
  const validFields = ['name', 'email', 'bio']
  const extraFields = Object.keys(req.body).filter(field => !validFields.includes(field))

  if (extraFields.length > 0) {
    errors.push({
      field: 'extra',
      message: `Campos no permitidos en el cuerpo de la petición: ${extraFields.join(', ')}`
    })
  }

  // Validaciones obligatorias para creación (POST)
  if (req.method === 'POST') {
    const nameError = validateName(name)
    if (nameError) errors.push({ field: 'name', message: nameError })

    const emailError = validateEmailStructure(email)
    if (emailError) errors.push({ field: 'email', message: emailError })

    const bioError = validateBio(bio)
    if (bioError) errors.push({ field: 'bio', message: bioError })
  }
  // Validaciones condicionales para actualización parcial (PUT)
  else {
    if (name === undefined && email === undefined && bio === undefined) {
      errors.push({ 
        field: 'body', 
        message: 'Debe proporcionar al menos un campo válido para actualizar (name, email o bio).' 
      })
    } else {
        if (name !== undefined) {
          const nameError = validateName(name)
          if (nameError) errors.push({ field: 'name', message: nameError })
        }
    
        if (email !== undefined) {
          const emailError = validateEmailStructure(email)
          if (emailError) errors.push({ field: 'email', message: emailError })
        }
    
        if (bio !== undefined) {
          const bioError = validateBio(bio)
          if (bioError) errors.push({ field: 'bio', message: bioError })
        }
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      status: 'fail',
      message: 'Errores de validación en los datos enviados.',
      errors
    })
  }

  next()
}

/**
 * Middleware para validar las propiedades del body de una Publicación (Post)
 */
export function validatePostMiddleware(req, res, next) {
  const errors = []
  const { title, content, author_id, published } = req.body

  // Protección de campos extra (Whitelisting para Posts)
  const validFields = ['title', 'content', 'author_id', 'published']
  const extraFields = Object.keys(req.body).filter(field => !validFields.includes(field))

  if (extraFields.length > 0) {
    errors.push({
      field: 'extra',
      message: `Campos no permitidos en el cuerpo de la petición: ${extraFields.join(', ')}`
    })
  }

  // Validaciones obligatorias para creación (POST)
  if (req.method === 'POST') {
    const titleError = validatePostTitle(title)
    if (titleError) errors.push({ field: 'title', message: titleError })

    const contentError = validatePostContent(content)
    if (contentError) errors.push({ field: 'content', message: contentError })

    if (author_id === undefined) {
      errors.push({ field: 'author_id', message: "El ID del autor es requerido." })
    } else if (isNaN(author_id)) {
      errors.push({ field: 'author_id', message: "El ID del autor debe ser un número válido." })
    }
  }
  // Validaciones condicionales para actualización parcial (PUT)
  else {
      if (title === undefined && content === undefined && published === undefined) {
        errors.push({ 
          field: 'body', 
          message: 'Debe proporcionar al menos un campo válido para actualizar (title, content o published).' 
        })
      } else {
        if (title !== undefined) {
          const titleError = validatePostTitle(title)
          if (titleError) errors.push({ field: 'title', message: titleError })
        }
    
        if (content !== undefined) {
          const contentError = validatePostContent(content)
          if (contentError) errors.push({ field: 'content', message: contentError })
        }
    
        if (author_id !== undefined) {
          errors.push({ field: 'extra', message: "No está permitido modificar el autor original de una publicación." })
        }
      }
  }

  // Validación del tipo de dato para 'published' si es que viene en la petición (POST o PUT)
  if (published !== undefined && typeof published !== 'boolean') {
    errors.push({ field: 'published', message: "El campo 'published' debe ser un valor booleano (true o false)." })
  }

  if (errors.length > 0) {
    return res.status(400).json({
      status: 'fail',
      message: 'Errores de validación en los datos enviados.',
      errors
    })
  }

  next()
}