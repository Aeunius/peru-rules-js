import * as alfanumerico from './alfanumerico'
import * as dni from './dni'
import * as ruc from './ruc'

/**
 * Tipos de documento de identidad del catálogo 06 de la SUNAT, con los mismos
 * códigos que usa la facturación electrónica.
 */
export const TipoDocumento = {
  NoDomiciliadoSinRuc: '0',
  Dni: '1',
  CarneExtranjeria: '4',
  Ruc: '6',
  Pasaporte: '7',
  CedulaDiplomatica: 'A',
} as const

export type TipoDocumento = (typeof TipoDocumento)[keyof typeof TipoDocumento]

/** Los códigos en el orden del catálogo: "0", "1", "4", "6", "7" y "A". */
export const TIPOS_DOCUMENTO: readonly TipoDocumento[] = Object.values(TipoDocumento)

const DESCRIPCIONES: Record<TipoDocumento, string> = {
  '0': 'Documento tributario de no domiciliado sin RUC',
  '1': 'DNI',
  '4': 'Carné de extranjería',
  '6': 'RUC',
  '7': 'Pasaporte',
  A: 'Cédula diplomática de identidad',
}

const LONGITUDES: Record<TipoDocumento, number> = {
  '0': 15,
  '1': 8,
  '4': 12,
  '6': 11,
  '7': 12,
  A: 15,
}

export function esTipoDocumento(tipo: unknown): tipo is TipoDocumento {
  return typeof tipo === 'string' && (TIPOS_DOCUMENTO as readonly string[]).includes(tipo)
}

export function descripcionDocumento(tipo: TipoDocumento): string {
  return DESCRIPCIONES[tipo]
}

/** Longitud máxima del número según el catálogo 06. */
export function longitudMaxima(tipo: TipoDocumento): number {
  return LONGITUDES[tipo]
}

/**
 * Valida el número con la regla que corresponde al tipo. Si el tipo no es uno
 * del catálogo 06, el número tampoco pasa.
 */
export function validarDocumento(tipo: TipoDocumento | string, numero: string): boolean {
  if (!esTipoDocumento(tipo)) {
    return false
  }

  switch (tipo) {
    case TipoDocumento.Dni:
      return dni.esValido(numero)
    case TipoDocumento.Ruc:
      return ruc.esValido(numero)
    default:
      return alfanumerico.esValido(numero, longitudMaxima(tipo))
  }
}
