import { type MaybeRefOrGetter, toValue } from 'vue'
import * as alfanumerico from '../alfanumerico'
import * as cci from '../cci'
import * as celular from '../celular'
import * as dni from '../dni'
import * as placa from '../placa'
import * as ruc from '../ruc'
import { recortar } from '../texto'
import {
  descripcionDocumento,
  esTipoDocumento,
  longitudMaxima,
  TipoDocumento,
} from '../tipo-documento'

/**
 * Una regla de formulario: devuelve true si el valor pasa, o el mensaje de
 * error. Es el formato que usan Vuetify (`:rules`), Quasar (`:rules`) y
 * VeeValidate (reglas como función), así que sirve sin adaptadores.
 */
export type Regla = (valor: unknown) => true | string

export interface Mensajes {
  requerido: string
  ruc: string
  rucNatural: string
  rucJuridica: string
  dni: string
  carneExtranjeria: string
  pasaporte: string
  /** Para los tipos 0 y A del catálogo 06. Admite `:tipo` y `:max`. */
  documento: string
  documentoTipo: string
  celular: string
  placa: string
  cci: string
}

export const MENSAJES: Readonly<Mensajes> = {
  requerido: 'Este campo es obligatorio.',
  ruc: 'El RUC no es válido.',
  rucNatural: 'El RUC no es válido o no es de persona natural (empieza con 10).',
  rucJuridica: 'El RUC no es válido o no es de persona jurídica (empieza con 20).',
  dni: 'El DNI no es válido: debe tener 8 dígitos.',
  carneExtranjeria: 'El carné de extranjería no es válido: debe tener hasta 12 letras o números.',
  pasaporte: 'El pasaporte no es válido: debe tener hasta 12 letras o números.',
  documento: 'El número de :tipo no es válido: debe tener hasta :max letras o números.',
  documentoTipo: 'Elige un tipo de documento válido.',
  celular: 'El celular no es válido: debe tener 9 dígitos y empezar con 9.',
  placa: 'La placa no es válida (por ejemplo, ABC-123 o 2171-AY).',
  cci: 'El CCI no es válido: debe tener 20 dígitos y sus dígitos de control.',
}

export interface OpcionesPeruRules {
  /**
   * Mensajes que reemplazan a los de MENSAJES. Puede ser un ref o una función,
   * para que cambien con el idioma: `mensajes: () => ({ ruc: t('ruc') })`.
   */
  mensajes?: MaybeRefOrGetter<Partial<Mensajes> | undefined>
}

export interface Reglas {
  /** El único que falla con un valor vacío. */
  requerido: Regla
  ruc: Regla
  rucNatural: Regla
  rucJuridica: Regla
  dni: Regla
  carneExtranjeria: Regla
  pasaporte: Regla
  /**
   * El número según el tipo de documento, que suele ser otro campo del
   * formulario: `reglas.documento(() => form.tipoDoc)`.
   */
  documento: (tipo: MaybeRefOrGetter<unknown>) => Regla
  celular: Regla
  placa: Regla
  cci: Regla
}

/**
 * Reglas de validación para formularios de Vue.
 *
 * Como en Laravel, las reglas no se aplican a un campo vacío (`''`, `null` o
 * `undefined`): para exigirlo, agrega `reglas.requerido`. Los números se
 * validan como texto, igual que los enteros en laravel-peru-rules.
 */
export function usePeruRules(opciones: OpcionesPeruRules = {}): {
  reglas: Reglas
  mensaje: (clave: keyof Mensajes) => string
} {
  const mensaje = (clave: keyof Mensajes): string =>
    toValue(opciones.mensajes)?.[clave] ?? MENSAJES[clave]

  const regla =
    (clave: keyof Mensajes, esValido: (valor: string) => boolean): Regla =>
    (valor) => {
      if (vacio(valor)) {
        return true
      }

      const texto = comoTexto(valor)

      return texto !== null && esValido(texto) ? true : mensaje(clave)
    }

  const reglas: Reglas = {
    requerido: (valor) => (vacio(valor) || enBlanco(valor) ? mensaje('requerido') : true),
    ruc: regla('ruc', (valor) => ruc.esValido(valor)),
    rucNatural: regla('rucNatural', (valor) => ruc.esValido(valor, [ruc.NATURAL])),
    rucJuridica: regla('rucJuridica', (valor) => ruc.esValido(valor, [ruc.JURIDICA])),
    dni: regla('dni', dni.esValido),
    carneExtranjeria: regla('carneExtranjeria', (valor) =>
      alfanumerico.esValido(valor, longitudMaxima(TipoDocumento.CarneExtranjeria)),
    ),
    pasaporte: regla('pasaporte', (valor) =>
      alfanumerico.esValido(valor, longitudMaxima(TipoDocumento.Pasaporte)),
    ),
    documento: (tipo) => (valor) => {
      if (vacio(valor)) {
        return true
      }

      const codigo = comoTexto(toValue(tipo))

      if (!esTipoDocumento(codigo)) {
        return mensaje('documentoTipo')
      }

      // DNI, RUC, carné de extranjería y pasaporte tienen su propia regla y su
      // propio mensaje; los demás tipos se validan aquí.
      switch (codigo) {
        case TipoDocumento.Dni:
          return reglas.dni(valor)
        case TipoDocumento.Ruc:
          return reglas.ruc(valor)
        case TipoDocumento.CarneExtranjeria:
          return reglas.carneExtranjeria(valor)
        case TipoDocumento.Pasaporte:
          return reglas.pasaporte(valor)
      }

      const texto = comoTexto(valor)
      const maximo = longitudMaxima(codigo)

      if (texto !== null && alfanumerico.esValido(texto, maximo)) {
        return true
      }

      return mensaje('documento')
        .replaceAll(':tipo', minusculaInicial(descripcionDocumento(codigo)))
        .replaceAll(':max', String(maximo))
    },
    celular: regla('celular', celular.esValido),
    placa: regla('placa', placa.esValido),
    cci: regla('cci', cci.esValido),
  }

  return { reglas, mensaje }
}

function vacio(valor: unknown): boolean {
  return valor === '' || valor === null || valor === undefined
}

/** Como `required` de Laravel: también falla con espacios o una lista vacía. */
function enBlanco(valor: unknown): boolean {
  return (
    (typeof valor === 'string' && recortar(valor) === '') ||
    (Array.isArray(valor) && valor.length === 0)
  )
}

function comoTexto(valor: unknown): string | null {
  if (typeof valor === 'string') {
    return valor
  }

  return typeof valor === 'number' && Number.isSafeInteger(valor) ? String(valor) : null
}

function minusculaInicial(texto: string): string {
  return texto.charAt(0).toLowerCase() + texto.slice(1)
}
