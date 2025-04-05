<script setup lang="ts">
import { ref, onMounted, nextTick, computed } from 'vue'
import ModalPpal from './ModalPpal.vue'
import TableCrud from './TableCrud.vue'
import type { CrudModalColumn } from '../types/CrudModalColumn'

interface TableCrudInterface {
    resetRows: () => void;
    getRows: (params: object) => void;
    resetInputs: () => void;
    destroyTable: () => void;
}

const tableCrud = ref<TableCrudInterface | null>(null);

const props = withDefaults(defineProps<{
    titulo: string
    subtitle?: string
    modalId: string //Tmb la uso para los id de la table

    // Para TableCrud
    model: string
    parameterRouteName?: string
    parameterRouteValue?: number
    params?: Record<string, any>
    // Requiere que una columna sea value id para que funcione el delete
    columnas: CrudModalColumn[]
    selectOptions?: any
    fatherField?: string
    config?: {
        show?: boolean
        large?: boolean
        datatable?: boolean
    }
    }>(), {
        parameterRouteName: 'id',
        parameterRouteValue: 0,
        params: () => ({}),
        selectOptions: () => [],
        fatherField: '',
        config: () => ({
            show: false,
            large: false,
            datatable: false
        })
    }
)

const parametersTableCrud = computed(() => ({
    model: props.model,
    parameterRouteName: props.parameterRouteName,
    parameterRouteValue: props.parameterRouteValue,
    columnas: props.columnas,
    datatable: props.config.datatable,
    selectOptions: props.selectOptions,
    fatherField: props.fatherField,
    id: props.modalId,
    config: props.config
}))

const parametersModal = computed(() => ({
    titulo: props.titulo,
    subtitle: props.subtitle,
    id: props.modalId,
    large: props.config.large
}))

onMounted(() => {
    let modal = document.getElementById(props.modalId);
    if (modal) {
        modal.addEventListener('show.bs.modal', () => {
            console.log('show modal', props)
            console.log('parametersTableCrud', parametersTableCrud)
            
            if (tableCrud.value) {
                tableCrud.value.resetRows();
            }
            nextTick(() => { // Sino el getRows se ejecuta antes de la actualización del parámetro  parameterRouteValue
                if (tableCrud.value) {
                    tableCrud.value.getRows(props.params);
                    tableCrud.value.resetInputs();// Para que setee valores fijos
                }
            });
            console.debug('show modal standard');
        });

        modal.addEventListener('hidden.bs.modal', () => {
            if (tableCrud.value) {
                tableCrud.value.destroyTable();
            }
        });
    } else {
        console.error(`Modal with id ${props.modalId} not found.`);
    }
})
</script>

<template>
    <ModalPpal v-bind="parametersModal">
        <template v-slot:bodymodal>
            <TableCrud ref="tableCrud" v-bind="parametersTableCrud"/>
        </template>
    </ModalPpal>
</template>