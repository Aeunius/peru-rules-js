/**
 * RUC (Registro Único de Contribuyentes) de la SUNAT.
 *
 * Solo comprueba formato, prefijo y dígito verificador: no consulta si el RUC
 * existe o está activo.
 */

/** Persona natural: el prefijo 10 seguido del DNI. */
export const NATURAL = '10'

/** Persona jurídica. */
export const JURIDICA = '20'

export const PREFIJOS: readonly string[] = ['10', '15', '16', '17', '20']

const PESOS = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2]

/** Tipo de contribuyente según el prefijo del RUC. */
export type TipoContribuyente = 'natural' | 'juridica' | 'especial'

const DESCRIPCIONES: Record<TipoContribuyente, string> = {
  natural: 'Persona natural',
  juridica: 'Persona jurídica',
  especial: 'Caso especial',
}

/**
 * @param prefijos Prefijos aceptados; por defecto, todos los válidos.
 */
export function esValido(ruc: string, prefijos: readonly string[] = PREFIJOS): boolean {
  if (typeof ruc !== 'string' || !/^\d{11}$/.test(ruc)) {
    return false
  }

  if (!prefijos.includes(ruc.slice(0, 2))) {
    return false
  }

  return digitoVerificador(ruc.slice(0, 10)) === Number(ruc[10])
}

/**
 * Calcula el dígito verificador a partir de los 10 primeros dígitos:
 * r = 11 − (Σ dígito × peso) mod 11, con 10 → 0 y 11 → 1.
 *
 * @throws {RangeError} si no recibe exactamente 10 dígitos.
 */
export function digitoVerificador(base: string): number {
  if (typeof base !== 'string' || !/^\d{10}$/.test(base)) {
    throw new RangeError('Se esperaban los 10 primeros dígitos del RUC.')
  }

  let suma = 0

  PESOS.forEach((peso, i) => {
    suma += Number(base[i]) * peso
  })

  return (11 - (suma % 11)) % 10
}

/** "20-13131295-5": prefijo, cuerpo y dígito verificador; null si no es válido. */
export function formatear(ruc: string): string | null {
  return esValido(ruc) ? `${ruc.slice(0, 2)}-${ruc.slice(2, 10)}-${ruc[10]}` : null
}

/** El tipo de contribuyente de un RUC válido, o null si no es válido. */
export function tipoContribuyente(ruc: string): TipoContribuyente | null {
  if (!esValido(ruc)) {
    return null
  }

  switch (ruc.slice(0, 2)) {
    case NATURAL:
      return 'natural'
    case JURIDICA:
      return 'juridica'
    default:
      return 'especial'
  }
}

/** "Persona natural", "Persona jurídica" o "Caso especial". */
export function descripcionContribuyente(tipo: TipoContribuyente): string {
  return DESCRIPCIONES[tipo]
}

/** El DNI de un RUC de persona natural válido, o null en los demás casos. */
export function dni(ruc: string): string | null {
  return tipoContribuyente(ruc) === 'natural' ? ruc.slice(2, 10) : null
}
