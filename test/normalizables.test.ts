import { describe, expect, test } from 'vitest'
import { cci, celular, placa } from '../src'
import * as casos from './casos'

const normalizables = [
  ['celular', celular, casos.celular],
  ['placa', placa, casos.placa],
  ['cci', cci, casos.cci],
] as const

describe.each(normalizables)('%s', (_nombre, modulo, { validos, invalidos }) => {
  test.each(validos)('acepta y normaliza %s', (_caso, entrada, normalizado) => {
    expect(modulo.esValido(entrada)).toBe(true)
    expect(modulo.normalizar(entrada)).toBe(normalizado)
  })

  test.each(invalidos)('rechaza %s', (_caso, entrada) => {
    expect(modulo.esValido(entrada)).toBe(false)
    expect(modulo.normalizar(entrada)).toBeNull()
  })

  test('rechaza lo que no es texto', () => {
    expect(modulo.normalizar(987654321 as unknown as string)).toBeNull()
  })
})

describe('cci.digitosControl', () => {
  test.each(casos.cci.validos)('calcula los de %s', (_caso, _entrada, digitos) => {
    expect(cci.digitosControl(digitos.slice(0, 6), digitos.slice(6, 18))).toBe(digitos.slice(18))
  })

  test('sigue el ejemplo del README', () => {
    // entidad + oficina 002191: 0×1 + 0×2 + 2×1 + 1×2 + 9×1 + 1×2 = 15 → 5
    // cuenta 000123456789: 0+0+0+2+2+6+4+(1+0)+6+(1+4)+8+(1+8) = 43 → 7
    expect(cci.digitosControl('002191', '000123456789')).toBe('57')
  })

  test.each(casos.cci.validos)(
    'acepta un solo par de control en %s',
    (_caso, _entrada, digitos) => {
      const validos = Array.from({ length: 100 }, (_, n) => String(n).padStart(2, '0')).filter(
        (control) => cci.esValido(`${digitos.slice(0, 18)}${control}`),
      )

      expect(validos).toHaveLength(1)
    },
  )

  test.each([
    ['00219', '000123456789'],
    ['002191', '00012345678'],
    ['00219A', '000123456789'],
  ])('exige las longitudes de cada parte: %s y %s', (entidadOficina, cuenta) => {
    expect(() => cci.digitosControl(entidadOficina, cuenta)).toThrow(RangeError)
  })
})
