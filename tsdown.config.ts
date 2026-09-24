import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: { index: 'src/index.ts', 'vue/index': 'src/vue/index.ts' },
  format: ['esm', 'cjs'],
  dts: { generator: 'oxc' },
  target: 'es2022',
  platform: 'neutral',
})
