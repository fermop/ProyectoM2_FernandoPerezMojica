const prohibitedCharacters = /[<>{}[\]\/\\|;:"]/;

/**
 * Valida que el nombre cumpla con las reglas del negocio.
 * @param {string} name 
 * @returns {string|null} Mensaje de error o null si es válido.
 */
export function validateName(name) {
  if (!name || name.trim() === '') return "El nombre es requerido."
  if (name.length > 100) return "El nombre no puede exceder los 100 caracteres."
  if (prohibitedCharacters.test(name)) return "El nombre no puede contener caracteres especiales."
  return null
}

/**
 * Valida la estructura, longitud y presencia del email.
 * @param {string} email 
 * @returns {string|null} Mensaje de error o null si es válido.
 */
export function validateEmailStructure(email) {
  if (!email || email.trim() === '') return "El correo es requerido."
  if (email.length > 50) return "El correo no puede exceder los 50 caracteres."
  
  if (!email.includes('@') || email.startsWith('@') || email.endsWith('@')) {
    return "El correo no tiene un dominio válido."
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return "El formato del correo electrónico es inválido."
  }
  
  return null
}
/**
 * Valida la longitud y caracteres de la biografía.
 * @param {string} bio 
 * @returns {string|null} Mensaje de error o null si es válido.
 */
export function validateBio(bio) {
  if (!bio) return null
  
  const cleanBio = bio.trim()
  if (cleanBio.length > 250) return "La biografía no puede exceder los 250 caracteres."
  if (prohibitedCharacters.test(cleanBio)) return "La biografía no puede contener caracteres especiales."
  return null
}