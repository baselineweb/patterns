import { defineConfig } from 'vite'
import { viteStaticCopy } from 'vite-plugin-static-copy'

export default defineConfig(({ command }) => ({
  base: '/patterns/',
  plugins: [
    viteStaticCopy({
      targets: [
        {
          src: 'src/components',
          dest: 'src'
        }
      ]
    })
  ]
}))
