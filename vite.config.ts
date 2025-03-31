// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
    plugins: [vue()],
    css: {
        preprocessorOptions: {
            scss: {
                // Agregué para que no me mande aviso de deprecated de bootstrap sass, cambia import por use
                silenceDeprecations: ['mixed-decls', 'import']
            },
        }
    },
    build: {
        lib: {
            entry: path.resolve(__dirname, 'src/index.mts'),
            name: 'UiBsKit',
            formats: ['es', 'umd'],
            fileName: (format) => `index.${format}.js`
        },
        rollupOptions: {
            external: ['vue', 'bootstrap', '@selectize/selectize', 'dayjs'],
            output: {
                globals: {
                vue: 'Vue',
                bootstrap: 'bootstrap',
                dayjs: 'dayjs',
                '@selectize/selectize': 'Selectize'
                }
            }
        }
    }
})
