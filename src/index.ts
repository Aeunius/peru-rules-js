export * as alfanumerico from './alfanumerico'
export * as cci from './cci'
export * as celular from './celular'
export * as dni from './dni'
export * as placa from './placa'
export * as ruc from './ruc'
export {
  descripcionContribuyente,
  dni as dniDeRuc,
  formatear as formatearRuc,
  type TipoContribuyente,
  tipoContribuyente,
} from './ruc'
export {
  descripcionDocumento,
  esTipoDocumento,
  longitudMaxima,
  TIPOS_DOCUMENTO,
  TipoDocumento,
  validarDocumento,
} from './tipo-documento'
