# Changelog

Todos los cambios importantes de este paquete se registran aquí.

El formato sigue [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/) y el
proyecto usa [versionado semántico](https://semver.org/lang/es/).

## [Sin publicar]

## [1.0.0] - 2026-09-23

Primera versión, con los mismos resultados que `aeunius/laravel-peru-rules` 1.0.2.

### Agregado

- `ruc`: `esValido()` con filtro de prefijos, `digitoVerificador()`,
  `formatear()`, `tipoContribuyente()`, `descripcionContribuyente()` y `dni()`,
  también como `formatearRuc()` y `dniDeRuc()`.
- `dni.esValido()` y `alfanumerico.esValido()`.
- `celular`, `placa` y `cci` con `esValido()` y `normalizar()`, y
  `cci.digitosControl()`.
- `TipoDocumento` con los códigos del catálogo 06 de la SUNAT,
  `validarDocumento()`, `esTipoDocumento()`, `descripcionDocumento()` y
  `longitudMaxima()`.
- `@aeunius/peru-rules/vue`: `usePeruRules()` con reglas para Vuetify, Quasar y
  VeeValidate, y mensajes en español que se pueden reemplazar.
- Los mismos casos de prueba que `laravel-peru-rules` v1.0.2.

[Sin publicar]: https://github.com/Aeunius/peru-rules-js/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/Aeunius/peru-rules-js/releases/tag/v1.0.0
