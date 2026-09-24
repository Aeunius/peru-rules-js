import { ESPACIO } from './texto'

/**
 * Código de Cuenta Interbancario (CCI): 20 dígitos.
 *
 *   entidad (3) + oficina (3) + cuenta (12) + control (2)
 *
 * El primer dígito de control verifica entidad + oficina, y el segundo, la
 * cuenta. Solo se comprueban el formato y los dígitos de control: no se
 * consulta si la cuenta existe ni si el código de entidad está asignado.
 */

const SEPARADORES = new RegExp(`${ESPACIO}|-`, 'g')

export function esValido(cci: string): boolean {
  return normalizar(cci) !== null
}

/**
 * Devuelve los 20 dígitos, o null si no es un CCI válido. Acepta espacios y
 * guiones: "002-540-102683583013-38" da "00254010268358301338".
 */
export function normalizar(cci: string): string | null {
  if (typeof cci !== 'string') {
    return null
  }

  const digitos = cci.replace(SEPARADORES, '')

  if (!/^\d{20}$/.test(digitos)) {
    return null
  }

  const control = digitosControl(digitos.slice(0, 6), digitos.slice(6, 18))

  return digitos.slice(18) === control ? digitos : null
}

/**
 * Calcula los dos dígitos de control.
 *
 * @param entidadOficina 6 dígitos: entidad (3) + oficina (3).
 * @param cuenta 12 dígitos.
 * @throws {RangeError} si las longitudes no son las esperadas.
 */
export function digitosControl(entidadOficina: string, cuenta: string): string {
  if (
    typeof entidadOficina !== 'string' ||
    typeof cuenta !== 'string' ||
    !/^\d{6}$/.test(entidadOficina) ||
    !/^\d{12}$/.test(cuenta)
  ) {
    throw new RangeError('Se esperaban 6 dígitos de entidad y oficina, y 12 de cuenta.')
  }

  return `${digito(entidadOficina)}${digito(cuenta)}`
}

/**
 * Pesos 1 y 2 alternados desde la izquierda; de cada producto se suman sus
 * dígitos (14 → 1 + 4). El dígito es lo que falta para la siguiente decena.
 */
function digito(numero: string): number {
  let suma = 0

  for (let i = 0; i < numero.length; i++) {
    const producto = Number(numero[i]) * (i % 2 === 0 ? 1 : 2)
    suma += Math.trunc(producto / 10) + (producto % 10)
  }

  return (10 - (suma % 10)) % 10
}
