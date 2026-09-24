import { describe, expect, test } from 'vitest'
import {
  descripcionContribuyente,
  dniDeRuc,
  formatearRuc,
  ruc,
  type TipoContribuyente,
  tipoContribuyente,
} from '../src'
import * as casos from './casos'

describe('ruc.esValido', () => {
  test.each(casos.ruc.validos)('acepta %s', (_nombre, numero) => {
    expect(ruc.esValido(numero)).toBe(true)
  })

  test.each(casos.ruc.invalidos)('rechaza %s', (_nombre, numero) => {
    expect(ruc.esValido(numero)).toBe(false)
  })

  test('rechaza el texto vacío', () => {
    expect(ruc.esValido('')).toBe(false)
  })

  test('filtra por prefijo', () => {
    expect(ruc.esValido('20131312955', [ruc.JURIDICA])).toBe(true)
    expect(ruc.esValido('20131312955', [ruc.NATURAL])).toBe(false)
    expect(ruc.esValido('10123456781', [ruc.NATURAL])).toBe(true)
    expect(ruc.esValido('10123456781', [ruc.JURIDICA])).toBe(false)
  })

  test('rechaza lo que no es texto', () => {
    expect(ruc.esValido(20131312955 as unknown as string)).toBe(false)
    expect(ruc.esValido(null as unknown as string)).toBe(false)
  })
})

describe('ruc.digitoVerificador', () => {
  test.each(casos.ruc.validos)('calcula el de %s', (_nombre, numero) => {
    expect(ruc.digitoVerificador(numero.slice(0, 10))).toBe(Number(numero[10]))
  })

  test.each(casos.ruc.juridicos)('acepta un solo dígito para la base de %s', (_nombre, numero) => {
    const validos = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].filter((d) =>
      ruc.esValido(`${numero.slice(0, 10)}${d}`),
    )

    expect(validos).toHaveLength(1)
  })

  test.each(['201313129', '20131312955', '201313129A'])('exige 10 dígitos: %s', (base) => {
    expect(() => ruc.digitoVerificador(base)).toThrow(RangeError)
  })
})

describe('funciones del RUC', () => {
  test('da el formato con guiones', () => {
    expect(formatearRuc('20131312955')).toBe('20-13131295-5')
    expect(formatearRuc('10123456781')).toBe('10-12345678-1')
    expect(formatearRuc('20131312956')).toBeNull()
  })

  test.each<[string, TipoContribuyente]>([
    ['10123456781', 'natural'],
    ['20131312955', 'juridica'],
    ['15123456782', 'especial'],
    ['16123456789', 'especial'],
    ['17123456785', 'especial'],
  ])('%s es de tipo %s', (numero, tipo) => {
    expect(tipoContribuyente(numero)).toBe(tipo)
  })

  test.each(casos.ruc.invalidos)('no da tipo para %s', (_nombre, numero) => {
    expect(tipoContribuyente(numero)).toBeNull()
  })

  test('describe el tipo de contribuyente', () => {
    expect(descripcionContribuyente('natural')).toBe('Persona natural')
    expect(descripcionContribuyente('juridica')).toBe('Persona jurídica')
    expect(descripcionContribuyente('especial')).toBe('Caso especial')
  })

  test('extrae el DNI solo de una persona natural', () => {
    expect(dniDeRuc('10123456781')).toBe('12345678')
    expect(dniDeRuc('20131312955')).toBeNull()
    expect(dniDeRuc('17123456785')).toBeNull()
    expect(dniDeRuc('10123456782')).toBeNull()
  })

  test('las funciones sueltas son las mismas que las del módulo', () => {
    expect(formatearRuc).toBe(ruc.formatear)
    expect(dniDeRuc).toBe(ruc.dni)
  })
})
