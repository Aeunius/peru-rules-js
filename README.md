# Peru Rules para JavaScript

Validación de documentos y datos peruanos en el navegador y en Node: RUC, DNI,
carné de extranjería, pasaporte, celular, placa vehicular y CCI. Valida el
formato y los dígitos de control sin conectarse a ningún servicio externo.

Es el gemelo en TypeScript de
[`aeunius/laravel-peru-rules`](https://github.com/Aeunius/laravel-peru-rules):
usa los mismos algoritmos y se prueba con los mismos casos, así que el formulario
da **exactamente** el mismo resultado que el backend en Laravel. Incluye reglas
listas para formularios de Vue (Vuetify, Quasar y VeeValidate).

[![ci](https://github.com/Aeunius/peru-rules-js/actions/workflows/ci.yml/badge.svg)](https://github.com/Aeunius/peru-rules-js/actions/workflows/ci.yml)
[![Versión en npm](https://img.shields.io/npm/v/@aeunius/peru-rules.svg)](https://www.npmjs.com/package/@aeunius/peru-rules)
[![Licencia](https://img.shields.io/npm/l/@aeunius/peru-rules.svg)](LICENSE.md)

## Qué valida

| Función | Qué comprueba |
|---|---|
| `ruc.esValido(ruc, prefijos?)` | 11 dígitos, prefijo `10`, `15`, `16`, `17` o `20`, y dígito verificador |
| `dni.esValido(dni)` | 8 dígitos |
| `alfanumerico.esValido(numero, max)` | Hasta `max` letras o números: carné de extranjería y pasaporte (12), tipos `0` y `A` (15) |
| `validarDocumento(tipo, numero)` | El número según el tipo de documento del catálogo 06 de la SUNAT |
| `celular.esValido(celular)` | 9 dígitos que empiezan con 9; acepta `+51` y separadores |
| `placa.esValido(placa)` | Autos: `ABC-123` o `A1B-234`, con o sin guion. Especiales con prefijo E: `E GA-123`, `eGA-123`. Motos: `2171-AY`, `5040-6C`, `C5-4481` |
| `cci.esValido(cci)` | 20 dígitos y los dos dígitos de control; acepta espacios y guiones |

Se comprueba que el número sea **válido**, no que **exista**: un RUC puede tener
un dígito verificador correcto y aun así no estar inscrito o no estar activo en
la SUNAT.

## Instalación

```bash
npm install @aeunius/peru-rules
```

Funciona en ESM y en CommonJS, trae sus tipos de TypeScript y no tiene
dependencias. Vue solo hace falta para `@aeunius/peru-rules/vue`.

## Uso

```ts
import { cci, celular, dni, placa, ruc } from '@aeunius/peru-rules'

ruc.esValido('20131312955')              // true
ruc.esValido('20131312955', [ruc.NATURAL]) // false: solo acepta el prefijo 10
ruc.digitoVerificador('2013131295')      // 5
dni.esValido('00123456')                 // true
celular.esValido('+51 987 654 321')      // true
placa.esValido('C5-4481')                // true
cci.esValido('002-191-000123456789-57')  // true
```

Los valores se validan tal como llegan: `20-13131295-5` o un RUC con espacios no
pasan. Las funciones reciben texto; con cualquier otro tipo devuelven `false`.

### RUC

```ts
import { dniDeRuc, formatearRuc, tipoContribuyente } from '@aeunius/peru-rules'

formatearRuc('20131312955')      // "20-13131295-5"
tipoContribuyente('20131312955') // "juridica"; también "natural" o "especial"
dniDeRuc('10123456781')          // "12345678"; null si no es de persona natural
formatearRuc('20131312956')      // null: no es un RUC válido
```

`ruc.formatear()`, `ruc.tipoContribuyente()` y `ruc.dni()` son las mismas
funciones.

### Documento según su tipo

Los tipos son los del **catálogo 06 de la SUNAT**, los mismos de la facturación
electrónica:

```ts
import { TipoDocumento, validarDocumento } from '@aeunius/peru-rules'

validarDocumento(TipoDocumento.Ruc, '20131312955') // true
validarDocumento('1', '12345678')                  // true: DNI
validarDocumento('9', '12345678')                  // false: el tipo no existe
```

| Código | `TipoDocumento` | Se valida con |
|---|---|---|
| `0` | `NoDomiciliadoSinRuc` | Hasta 15 letras o números |
| `1` | `Dni` | `dni.esValido` |
| `4` | `CarneExtranjeria` | Hasta 12 letras o números |
| `6` | `Ruc` | `ruc.esValido` |
| `7` | `Pasaporte` | Hasta 12 letras o números |
| `A` | `CedulaDiplomatica` | Hasta 15 letras o números |

También están `TIPOS_DOCUMENTO` (los seis códigos), `esTipoDocumento()`,
`descripcionDocumento()` y `longitudMaxima()`.

### Celular, placa y CCI: normalizar antes de guardar

Celular, placa y CCI aceptan varias formas de escribir el mismo dato. Para
guardarlo siempre igual, normalízalo. Si no es válido, se obtiene `null`:

```ts
celular.normalizar('+51 987 654 321')          // "987654321"
placa.normalizar('abc123')                     // "ABC-123"
placa.normalizar('e GA-123')                   // "EGA-123"
placa.normalizar('2171ay')                     // "2171-AY"
cci.normalizar('002-191-000123456789-57')      // "00219100012345678957"
cci.digitosControl('002191', '000123456789')   // "57"
celular.normalizar('014567890')                // null: no es un celular
```

En las placas de motos del tipo `C5-4481` el guion es obligatorio: sin él,
`C54481` se lee como la placa de auto `C54-481`.

## Vue

`usePeruRules()` devuelve reglas con la forma `(valor) => true | "mensaje"`, la
que usan Vuetify, Quasar y VeeValidate, así que se pasan sin adaptadores:

```vue
<script setup lang="ts">
import { usePeruRules } from '@aeunius/peru-rules/vue'

const { reglas } = usePeruRules()
</script>

<template>
  <!-- Vuetify -->
  <v-text-field v-model="ruc" :rules="[reglas.requerido, reglas.ruc]" />

  <!-- Quasar -->
  <q-input v-model="celular" :rules="[reglas.celular]" />
</template>
```

```ts
// VeeValidate
const { value, errorMessage } = useField('cci', [reglas.requerido, reglas.cci])
```

| Regla | Qué comprueba |
|---|---|
| `requerido` | Que haya un valor: falla con `''`, `null`, `undefined`, solo espacios o una lista vacía |
| `ruc`, `rucNatural`, `rucJuridica` | RUC válido; las variantes exigen el prefijo `10` o `20` |
| `dni` | 8 dígitos |
| `carneExtranjeria`, `pasaporte` | Hasta 12 letras o números |
| `documento(tipo)` | El número según el tipo de documento |
| `celular`, `placa`, `cci` | Como las funciones de arriba |

Como en Laravel, las reglas no se aplican a un campo vacío (`''`, `null` o
`undefined`): para exigirlo, agrega `reglas.requerido`. Los números
(`v-model.number`) se validan como texto.

`documento` recibe el tipo como valor, `ref` o función, y lo lee cada vez que
valida, así que sigue al campo del tipo:

```ts
const form = reactive({ tipoDoc: '1', numDoc: '' })
const reglaNumero = reglas.documento(() => form.tipoDoc)
```

Con DNI, RUC, carné de extranjería y pasaporte, el mensaje de error es el de la
regla de ese tipo.

### Mensajes

Los mensajes vienen en español (`MENSAJES`) y se reemplazan uno por uno:

```ts
const { reglas } = usePeruRules({
  mensajes: { ruc: 'Revisa el RUC.' },
})
```

`mensajes` también puede ser un `ref` o una función, para que siga al idioma de
la aplicación, por ejemplo con vue-i18n:

```ts
const { t } = useI18n()
const { reglas } = usePeruRules({
  mensajes: () => ({ ruc: t('validacion.ruc'), dni: t('validacion.dni') }),
})
```

En el mensaje de `documento` (tipos `0` y `A`) se reemplazan `:tipo` y `:max`.

## Cómo se valida

El RUC usa módulo 11 con los pesos `5 4 3 2 7 6 5 4 3 2`; el CCI, pesos 1 y 2
alternados con suma de cifras y complemento a la decena. El paso a paso, con
ejemplos, está en el README de
[`laravel-peru-rules`](https://github.com/Aeunius/laravel-peru-rules#cómo-se-valida-el-ruc).

## Los mismos resultados que en Laravel

Los casos de prueba están en `tests/fixtures` de `laravel-peru-rules`, y este
paquete los descarga desde una etiqueta fija de ese repositorio a
[`test/fixtures`](test/fixtures). Los dos paquetes se prueban con esos mismos
archivos, y el CI comprueba que no se editen a mano.

Donde JavaScript y PHP difieren, el paquete sigue a PHP: `trim()` y
`toUpperCase()` de JavaScript también tratan caracteres Unicode, y `\s` reconoce
el espacio no separable. Aquí, como en PHP, solo cuentan los espacios y las
letras ASCII.

## Desarrollo

Todo corre en Docker con la imagen oficial `node:24`, así que no hace falta
tener Node instalado:

```bash
make install    # dependencias
make test       # Vitest
make lint       # Biome y tipos, sin cambiar archivos
make build      # compila a dist/
make check      # revisa el paquete que se publicaría
make fixtures   # vuelve a descargar los casos compartidos
make help       # todos los comandos
```

Para cambiar una regla: se cambian primero los casos en `laravel-peru-rules`, se
publica un tag, y aquí se cambia `ETIQUETA` en
[`scripts/fixtures.mjs`](scripts/fixtures.mjs), se corre `make fixtures` y se
ajusta el código hasta que pasen los tests.

Cada release de GitHub publica la versión en npm, con *provenance*.

El CI prueba con Node 22 y 24.

Los cambios de cada versión están en el [CHANGELOG](CHANGELOG.md).

## Licencia

MIT. Ver [LICENSE.md](LICENSE.md).
