import { describe, expect, test } from 'vitest'
import {
  alfanumerico,
  descripcionDocumento,
  dni,
  esTipoDocumento,
  longitudMaxima,
  TIPOS_DOCUMENTO,
  TipoDocumento,
  validarDocumento,
} from '../src'
import * as casos from './casos'

describe('dni.esValido', () => {
  test.each(casos.dni.validos)('acepta %s', (_nombre, numero) => {
    expect(dni.esValido(numero)).toBe(true)
  })

  test.each(casos.dni.invalidos)('rechaza %s', (_nombre, numero) => {
    expect(dni.esValido(numero)).toBe(false)
  })
})

describe('alfanumerico.esValido', () => {
  test('limita a la longitud máxima', () => {
    expect(alfanumerico.esValido('A'.repeat(12), 12)).toBe(true)
    expect(alfanumerico.esValido('A'.repeat(13), 12)).toBe(false)
    expect(alfanumerico.esValido('', 12)).toBe(false)
  })

  test('rechaza cualquier número con un máximo menor que 1', () => {
    expect(alfanumerico.esValido('A', 0)).toBe(false)
  })
})

describe('TipoDocumento', () => {
  test('usa los códigos del catálogo 06 de la SUNAT', () => {
    expect(TIPOS_DOCUMENTO).toEqual(['0', '1', '4', '6', '7', 'A'])
  })

  test.each(casos.tiposDocumento)('valida el número de %s', (_nombre, tipo, valido, invalido) => {
    expect(validarDocumento(tipo, valido)).toBe(true)
    expect(validarDocumento(tipo, invalido)).toBe(false)
  })

  test.each(['', '2', 'a', '06'])('no valida con el tipo inexistente "%s"', (tipo) => {
    expect(esTipoDocumento(tipo)).toBe(false)
    expect(validarDocumento(tipo, '12345678')).toBe(false)
  })

  test('tiene descripción y longitud máxima', () => {
    expect(descripcionDocumento(TipoDocumento.Ruc)).toBe('RUC')
    expect(descripcionDocumento(TipoDocumento.CedulaDiplomatica)).toBe(
      'Cédula diplomática de identidad',
    )
    expect(TIPOS_DOCUMENTO.map(longitudMaxima)).toEqual([15, 8, 12, 11, 12, 15])
  })
})
