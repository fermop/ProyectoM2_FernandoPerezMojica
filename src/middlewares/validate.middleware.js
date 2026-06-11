import { validateName, validateEmailStructure } from '#utils/validators.js'

/**
 * Middleware para validar que el parámetro ID de la URL sea estrictamente numérico
 */
export function validateIdMiddleware(req, res, next) {
  const { id } = req.params

  if (id !== undefined && isNaN(id)) {
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
  const { name, email } = req.body

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
  }
  // Validaciones condicionales para actualización parcial (PUT)
  else {
    if (name !== undefined) {
      const nameError = validateName(name)
      if (nameError) errors.push({ field: 'name', message: nameError })
    }

    if (email !== undefined) {
      const emailError = validateEmailStructure(email)
      if (emailError) errors.push({ field: 'email', message: emailError })
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