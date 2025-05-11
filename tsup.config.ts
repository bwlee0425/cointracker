import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['frontend/src/main.ts'],
  outDir: 'dist-electron',
  format: ['cjs'],
  target: 'node14',
  external: ['electron'], // ❗ electron은 외부 모듈로 유지해야 함
  clean: true,
})
