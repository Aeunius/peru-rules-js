import { ESPACIO } from './texto'

/**
 * Celular peruano: 9 dígitos que empiezan con 9.
 */

const SEPARADORES = new RegExp(`${ESPACIO}|[-.()]`, 'g')

export function esValido(celular: string): boolean {
  return normalizar(celular) !== null
}

/**
 * Devuelve los 9 dígitos, o null si no es un celular válido.
 *
 * Acepta el código de país (+51 o 51) y los separadores de uso común:
 * espacios, guiones, puntos y paréntesis. "+51 987 654 321",
 * "51987654321" y "987-654-321" dan "987654321".
 */
export function normalizar(celular: string): string | null {
  if (typeof celular !== 'string') {
    return null
  }

  const partes = /^(?:\+?51)?(9\d{8})$/.exec(celular.replace(SEPARADORES, ''))

  return partes?.[1] ?? null
}
