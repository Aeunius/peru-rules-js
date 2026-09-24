// Equivalentes de las funciones de texto de PHP, para que los resultados sean
// idénticos a los de laravel-peru-rules. Las de JavaScript son más amplias:
// trim() quita también los espacios Unicode y toUpperCase() convierte "ß" en "SS".

/** Lo que coincide con \s en PCRE sin el modificador u: solo espacios ASCII. */
export const ESPACIO = '[\\t\\n\\v\\f\\r ]'

const BORDES = /^[\t\n\v\r\0 ]+|[\t\n\v\r\0 ]+$/g

/** trim() de PHP: espacio, \t, \n, \r, \0 y \v, pero no \f. */
export function recortar(texto: string): string {
  return texto.replace(BORDES, '')
}

/** strtoupper() de PHP: solo convierte las letras ASCII. */
export function mayusculas(texto: string): string {
  return texto.replace(/[a-z]+/g, (letras) => letras.toUpperCase())
}
