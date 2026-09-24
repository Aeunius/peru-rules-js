/**
 * Número de DNI de la RENIEC: 8 dígitos.
 */
export function esValido(dni: string): boolean {
  return typeof dni === 'string' && /^\d{8}$/.test(dni)
}
