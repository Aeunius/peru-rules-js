// Casos compartidos con laravel-peru-rules: test/fixtures se descarga con
// `make fixtures` y no se edita a mano.

import cciJson from './fixtures/cci.json'
import celularJson from './fixtures/celular.json'
import dniJson from './fixtures/dni.json'
import placaJson from './fixtures/placa.json'
import rucJson from './fixtures/ruc.json'
import tipoDocumentoJson from './fixtures/tipo-documento.json'

type Simples = Record<string, string>
type Pares = Record<string, string[]>

/** nombre → valor, como [nombre, valor] para test.each. */
function simples(casos: Simples): [string, string][] {
  return Object.entries(casos)
}

/** nombre → [a, b], como [nombre, a, b] para test.each. */
function pares(casos: Pares): [string, string, string][] {
  return Object.entries(casos).map(([nombre, [a, b]]) => [nombre, a as string, b as string])
}

export const ruc = {
  juridicos: simples(rucJson.juridicos),
  validos: simples({ ...rucJson.juridicos, ...rucJson.naturales, ...rucJson.especiales }),
  invalidos: simples(rucJson.invalidos),
}

export const dni = { validos: simples(dniJson.validos), invalidos: simples(dniJson.invalidos) }
export const celular = {
  validos: pares(celularJson.validos),
  invalidos: simples(celularJson.invalidos),
}
export const placa = { validos: pares(placaJson.validos), invalidos: simples(placaJson.invalidos) }
export const cci = { validos: pares(cciJson.validos), invalidos: simples(cciJson.invalidos) }

/** [nombre, código, número válido, número inválido] */
export const tiposDocumento: [string, string, string, string][] = Object.entries(
  tipoDocumentoJson as Pares,
).map(([nombre, [tipo, valido, invalido]]) => [
  nombre,
  tipo as string,
  valido as string,
  invalido as string,
])
