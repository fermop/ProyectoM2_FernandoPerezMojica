import { validateName, validateEmailStructure } from '#utils/validators.js'

export function validateAuthorMiddleware(req, res, next) {
  const { name, email } = req.body
  const errors = []

  const nameError = validateName(name)
  if (nameError) errors.push({ field: 'name', message: nameError })

  const emailError = validateEmailStructure(email)
  if (emailError) errors.push({ field: 'email', message: emailError })

  if (errors.length > 0) {
    return res.status(400).json({
      status: 'fail',
      message: 'Errores de validación en los datos enviados.',
      errors
    })
  }

  next()
}