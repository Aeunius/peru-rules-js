/**
 * Documentos que el catálogo 06 de la SUNAT solo define como "alfanumérico de
 * hasta N caracteres": carné de extranjería, pasaporte, cédula diplomática y
 * documento tributario de no domiciliado.
 */
export function esValido(numero: string, maximo: number): boolean {
  return typeof numero === 'string' && numero.length <= maximo && /^[A-Za-z0-9]+$/.test(numero)
}
