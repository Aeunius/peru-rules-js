import { ESPACIO, mayusculas, recortar } from './texto'

/**
 * Placa vehicular peruana.
 *
 * - Autos y demás vehículos: una letra, dos letras o dígitos y tres dígitos
 *   ("ABC-123", "A1B-234"), con o sin guion.
 * - Especiales, con prefijo E (Estado "EGA-123", policía "EPA-123",
 *   emergencias "EUA-123", diplomáticas "ECD-123"). Suelen escribirse con la E
 *   separada o en minúscula ("E GA-123", "eGA-123"); ambas formas se aceptan.
 * - Motos y mototaxis (categoría L): cuatro dígitos y dos caracteres
 *   ("2171-AY", "5040-6C"), o dos caracteres y cuatro dígitos ("C5-4481"). En
 *   los dos caracteres hay al menos una letra. La segunda forma exige el guion:
 *   sin él, "C54481" se lee como la placa de auto "C54-481".
 *
 * Todavía no cubre las placas de motos de siete caracteres que se entregan
 * desde diciembre de 2025.
 */

/** Dos caracteres con al menos una letra. */
const PAR = '(?=[A-Z0-9]{0,1}[A-Z])[A-Z0-9]{2}'

const ESPECIAL = new RegExp(`^E${ESPACIO}(?=[A-Z]{2})`)

const FORMATOS = [
  /^([A-Z][A-Z0-9]{2})-?(\d{3})$/,
  new RegExp(`^(\\d{4})-?(${PAR})$`),
  new RegExp(`^(${PAR})-(\\d{4})$`),
]

export function esValido(placa: string): boolean {
  return normalizar(placa) !== null
}

/**
 * Devuelve la placa en mayúsculas y con guion ("ABC-123", "2171-AY",
 * "C5-4481"), o null si no es una placa válida.
 */
export function normalizar(placa: string): string | null {
  if (typeof placa !== 'string') {
    return null
  }

  // "E GA-123" → "EGA-123": el espacio solo se admite tras la E de las especiales.
  const texto = mayusculas(recortar(placa)).replace(ESPECIAL, 'E')

  for (const formato of FORMATOS) {
    const partes = formato.exec(texto)

    if (partes) {
      return `${partes[1]}-${partes[2]}`
    }
  }

  return null
}
