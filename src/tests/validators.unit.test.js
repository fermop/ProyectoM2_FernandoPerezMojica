import {
  validateName,
  validateEmailStructure,
  validateBio,
  validatePostTitle,
  validatePostContent
} from '#utils/validators.js'

describe('Pruebas Unitarias - Validadores de Autores', () => {
  describe('validateName', () => {
    it('Debería retornar un error si el nombre es vacío o no se provee', () => {
      expect(validateName('')).toBe('El nombre es requerido.')
      expect(validateName(null)).toBe('El nombre es requerido.')
    })

    it('Debería retornar un error si el nombre excede los 100 caracteres', () => {
      const longName = 'a'.repeat(101)
      expect(validateName(longName)).toBe('El nombre no puede exceder los 100 caracteres.')
    })

    it('Debería retornar un error si contiene caracteres especiales prohibidos', () => {
      expect(validateName('Alan Turing <')).toBe('El nombre no puede contener caracteres especiales.')
      expect(validateName('Alan; Turing')).toBe('El nombre no puede contener caracteres especiales.')
    })

    it('Debería retornar null para un nombre válido', () => {
      expect(validateName('Alan Turing')).toBeNull()
      expect(validateName('Ada Lovelace')).toBeNull()
    })
  })

  describe('validateEmailStructure', () => {
    it('Debería retornar un error si el correo es vacío', () => {
      expect(validateEmailStructure('')).toBe('El correo es requerido.')
    })

    it('Debería retornar un error si el correo excede los 50 caracteres', () => {
      const longEmail = 'a'.repeat(45) + '@test.com'
      expect(validateEmailStructure(longEmail)).toBe('El correo no puede exceder los 50 caracteres.')
    })

    it('Debería retornar un error si no contiene un dominio o formato @ válido', () => {
      expect(validateEmailStructure('alan@')).toBe('El correo no tiene un dominio válido.')
      expect(validateEmailStructure('@turing.com')).toBe('El correo no tiene un dominio válido.')
      expect(validateEmailStructure('alanturing.com')).toBe('El correo no tiene un dominio válido.')
    })

    it('Debería retornar un error si el formato general es inválido', () => {
      expect(validateEmailStructure('alan.turing@com')).toBe('El formato del correo electrónico es inválido.')
    })

    it('Debería retornar null para correos válidos', () => {
      expect(validateEmailStructure('alan@turing.com')).toBeNull()
      expect(validateEmailStructure('grace.hopper@navy.mil')).toBeNull()
    })
  })

  describe('validateBio', () => {
    it('Debería retornar null si la biografía es vacía u omitida', () => {
      expect(validateBio('')).toBeNull()
      expect(validateBio(null)).toBeNull()
    })

    it('Debería retornar un error si la biografía excede los 255 caracteres', () => {
      const longBio = 'a'.repeat(256)
      expect(validateBio(longBio)).toBe('La biografía no puede exceder los 255 caracteres.')
    })

    it('Debería retornar un error si contiene caracteres especiales', () => {
      expect(validateBio('Biografía con ; punto y coma')).toBe('La biografía no puede contener caracteres especiales.')
    })

    it('Debería retornar null para una biografía válida', () => {
      expect(validateBio('Científica de la computación pionera en sistemas.')).toBeNull()
    })
  })
})

describe('Pruebas Unitarias - Validadores de Publicaciones', () => {
  describe('validatePostTitle', () => {
    it('Debería retornar un error si el título es vacío', () => {
      expect(validatePostTitle('')).toBe('El título es requerido.')
    })

    it('Debería retornar un error si el título excede los 50 caracteres', () => {
      const longTitle = 'a'.repeat(51)
      expect(validatePostTitle(longTitle)).toBe('El título no puede exceder los 50 caracteres.')
    })

    it('Debería retornar un error si contiene caracteres especiales', () => {
      expect(validatePostTitle('Título con <tag>')).toBe('El título no puede contener caracteres especiales.')
    })

    it('Debería retornar null para títulos válidos', () => {
      expect(validatePostTitle('Estructurando una API REST')).toBeNull()
    })
  })

  describe('validatePostContent', () => {
    it('Debería retornar un error si el contenido es vacío', () => {
      expect(validatePostContent('')).toBe('El contenido es requerido.')
    })

    it('Debería retornar un error si contiene caracteres especiales', () => {
      expect(validatePostContent('Contenido con / barra')).toBe('El contenido no puede contener caracteres especiales.')
    })

    it('Debería retornar null para contenidos válidos', () => {
      expect(validatePostContent('Contenido de prueba sin caracteres especiales')).toBeNull()
    })
  })
})
