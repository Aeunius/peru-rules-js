// Descarga los casos de prueba compartidos de laravel-peru-rules a test/fixtures.
//
// Se descargan de una etiqueta fija para que los casos solo cambien cuando se
// cambia ETIQUETA a propósito: npm run fixtures (o make fixtures).

import { writeFile } from 'node:fs/promises'

const ETIQUETA = 'v1.0.2'
const ARCHIVOS = ['ruc', 'dni', 'celular', 'placa', 'cci', 'tipo-documento']
const BASE = `https://raw.githubusercontent.com/Aeunius/laravel-peru-rules/${ETIQUETA}/tests/fixtures`

for (const archivo of ARCHIVOS) {
  const respuesta = await fetch(`${BASE}/${archivo}.json`)

  if (!respuesta.ok) {
    throw new Error(`No se pudo descargar ${archivo}.json de ${ETIQUETA}: HTTP ${respuesta.status}`)
  }

  const texto = await respuesta.text()
  JSON.parse(texto)

  await writeFile(new URL(`../test/fixtures/${archivo}.json`, import.meta.url), texto)
  console.log(`test/fixtures/${archivo}.json`)
}

console.log(`Casos de laravel-peru-rules ${ETIQUETA}.`)
