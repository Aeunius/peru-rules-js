// @vitest-environment happy-dom

import { mount } from '@vue/test-utils'
import { describe, expect, test } from 'vitest'
import { computed, defineComponent, h, ref } from 'vue'
import { MENSAJES, type Regla, usePeruRules } from '../src/vue'
import * as casos from './casos'

const { reglas } = usePeruRules()

describe('reglas', () => {
  test.each(casos.ruc.validos)('acepta el RUC %s', (_nombre, numero) => {
    expect(reglas.ruc(numero)).toBe(true)
  })

  test.each(casos.ruc.invalidos)('rechaza el RUC %s', (_nombre, numero) => {
    expect(reglas.ruc(numero)).toBe(MENSAJES.ruc)
  })

  test.each([
    ['dni', casos.dni],
    ['celular', casos.celular],
    ['placa', casos.placa],
    ['cci', casos.cci],
  ] as const)('valida %s con los casos compartidos', (nombre, { validos, invalidos }) => {
    for (const [, entrada] of validos) {
      expect(reglas[nombre](entrada)).toBe(true)
    }

    for (const [, entrada] of invalidos.filter(([, entrada]) => entrada !== '')) {
      expect(reglas[nombre](entrada)).toBe(MENSAJES[nombre])
    }
  })

  test('filtra el RUC por tipo de contribuyente', () => {
    expect(reglas.rucNatural('10123456781')).toBe(true)
    expect(reglas.rucNatural('20131312955')).toBe(MENSAJES.rucNatural)
    expect(reglas.rucJuridica('20131312955')).toBe(true)
    expect(reglas.rucJuridica('10123456781')).toBe(MENSAJES.rucJuridica)
  })

  test('valida el carné de extranjería y el pasaporte', () => {
    expect(reglas.carneExtranjeria('001234567')).toBe(true)
    expect(reglas.carneExtranjeria('0012345678901')).toBe(MENSAJES.carneExtranjeria)
    expect(reglas.pasaporte('AB1234567')).toBe(true)
    expect(reglas.pasaporte('AB 1234567')).toBe(MENSAJES.pasaporte)
  })

  const todas = Object.entries(reglas).filter(
    ([nombre]) => nombre !== 'requerido' && nombre !== 'documento',
  ) as [string, Regla][]

  test.each(todas)('%s no se aplica a un campo vacío', (_nombre, regla) => {
    expect(regla('')).toBe(true)
    expect(regla(null)).toBe(true)
    expect(regla(undefined)).toBe(true)
  })

  test('requerido falla con un campo vacío, en blanco o una lista vacía', () => {
    for (const valor of ['', '  ', null, undefined, []]) {
      expect(reglas.requerido(valor)).toBe(MENSAJES.requerido)
    }

    for (const valor of ['a', 0, false, ['a']]) {
      expect(reglas.requerido(valor)).toBe(true)
    }
  })

  test('valida los números como texto', () => {
    expect(reglas.ruc(20131312955)).toBe(true)
    expect(reglas.dni(12345678)).toBe(true)
    expect(reglas.celular(987654321)).toBe(true)
    expect(reglas.dni(1234567.8)).toBe(MENSAJES.dni)
    expect(reglas.ruc({})).toBe(MENSAJES.ruc)
  })
})

describe('reglas.documento', () => {
  test.each(casos.tiposDocumento)('valida el número de %s', (_nombre, tipo, valido, invalido) => {
    const regla = reglas.documento(tipo)

    expect(regla(valido)).toBe(true)
    expect(regla(invalido)).not.toBe(true)
  })

  test('usa el mensaje de la regla de cada tipo', () => {
    expect(reglas.documento('1')('123')).toBe(MENSAJES.dni)
    expect(reglas.documento('6')('123')).toBe(MENSAJES.ruc)
    expect(reglas.documento('4')('A-1')).toBe(MENSAJES.carneExtranjeria)
    expect(reglas.documento('7')('A-1')).toBe(MENSAJES.pasaporte)
  })

  test('completa el tipo y el máximo en el mensaje de los demás', () => {
    expect(reglas.documento('A')('CD 12345')).toBe(
      'El número de cédula diplomática de identidad no es válido: debe tener hasta 15 letras o números.',
    )
  })

  test('falla si el tipo no es válido', () => {
    expect(reglas.documento('9')('12345678')).toBe(MENSAJES.documentoTipo)
    expect(reglas.documento(null)('12345678')).toBe(MENSAJES.documentoTipo)
    expect(reglas.documento(null)('')).toBe(true)
  })

  test('acepta el tipo como número', () => {
    expect(reglas.documento(6)('20131312955')).toBe(true)
  })

  test('sigue al tipo cuando cambia', () => {
    const tipo = ref('1')
    const regla = reglas.documento(tipo)

    expect(regla('12345678')).toBe(true)

    tipo.value = '6'

    expect(regla('12345678')).toBe(MENSAJES.ruc)
  })
})

describe('mensajes', () => {
  test('se reemplazan', () => {
    const { reglas } = usePeruRules({ mensajes: { ruc: 'RUC inválido' } })

    expect(reglas.ruc('123')).toBe('RUC inválido')
    expect(reglas.dni('123')).toBe(MENSAJES.dni)
  })

  test('siguen a un ref o una función', () => {
    const idioma = ref<'es' | 'en'>('es')
    const { reglas, mensaje } = usePeruRules({
      mensajes: () => (idioma.value === 'en' ? { ruc: 'Invalid RUC.' } : {}),
    })

    expect(reglas.ruc('123')).toBe(MENSAJES.ruc)

    idioma.value = 'en'

    expect(reglas.ruc('123')).toBe('Invalid RUC.')
    expect(mensaje('ruc')).toBe('Invalid RUC.')
  })
})

describe('en un componente', () => {
  // Un campo como los de Vuetify o Quasar: recibe :rules y muestra el primer error.
  const Campo = defineComponent({
    props: { rules: { type: Array as () => Regla[], required: true } },
    setup(props) {
      const valor = ref('')
      const error = computed(() => {
        for (const regla of props.rules) {
          const resultado = regla(valor.value)

          if (resultado !== true) {
            return resultado
          }
        }

        return ''
      })

      return () =>
        h('div', [
          h('input', {
            value: valor.value,
            onInput: (e: Event) => {
              valor.value = (e.target as HTMLInputElement).value
            },
          }),
          h('p', error.value),
        ])
    },
  })

  const Formulario = defineComponent({
    setup() {
      const { reglas } = usePeruRules()

      return () => h(Campo, { rules: [reglas.requerido, reglas.ruc] })
    },
  })

  test('muestra el error mientras se escribe', async () => {
    const wrapper = mount(Formulario)
    const input = wrapper.get('input')

    expect(wrapper.get('p').text()).toBe(MENSAJES.requerido)

    await input.setValue('2013131295')
    expect(wrapper.get('p').text()).toBe(MENSAJES.ruc)

    await input.setValue('20131312955')
    expect(wrapper.get('p').text()).toBe('')
  })
})
