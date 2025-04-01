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
        sourcemap: true,
        lib: {
            entry: path.resolve(__dirname, 'src/index.mts'),
            name: 'UiBsKit',
            formats: ['es', 'umd'],
            fileName: (format) => `index.${format}.js`
        },
        rollupOptions: {
            // MUY IMPORTANTE para que no me agregue esto al budnle del paquete, y no lo duplique con la app principal. VAN TODAS LAS DE peerDependencies
            external: ['vue', 'vue-router', 'bootstrap', '@selectize/selectize', 'dayjs', '@intracompany/commons_front'
                , 'datatables.net-bs5', 'datatables.net-buttons-bs5', 'jquery', '@vitejs/plugin-vue', 'axios', 'vite'
            ],
            output: {
                globals: {
                    '@intracompany/commons_front': 'CommonsFront',
                    vue: 'Vue',
                    bootstrap: 'bootstrap',
                    dayjs: 'dayjs',
                    'vue-router': 'VueRouter',
                    '@selectize/selectize': 'Selectize',
                    'datatables.net-bs5': 'DataTables',
                    'datatables.net-buttons-bs5': 'DataTablesButtons',
                    jquery: 'jQuery',
                    axios: 'axios',
                    'vite': 'Vite'
                    
                }
            }
        }
    }
})
