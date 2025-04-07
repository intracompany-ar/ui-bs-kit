<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import '@selectize/selectize'
import axios from 'axios'
import $ from 'jquery'

type SelectizeConfig = {
    getRowsOnDemand?: boolean
    incluyeTodos?: boolean
    useIndex?: boolean
    sm?: boolean
    withoutLabel?: boolean
}

const defaultConfig: SelectizeConfig = {
    getRowsOnDemand: false,
    incluyeTodos: false,
    useIndex: false,
    sm: false,
    withoutLabel: false,
}

const model = defineModel()
const text = defineModel('text')

const emit = defineEmits(['mounted'])

const RANDOM_ID = Math.round(Math.random() * 10000000);

const props = defineProps<{
    name?: string
    id?: string
    model: string
    customUrl?: string
    params?: Record<string, any>
    config?: SelectizeConfig
}>();

const rows = ref([]);

// Valor por defecto para el id y name
const name = computed(() => props.name ?? 'selectize_base_id')
const id = computed(() => props.id ?? 'selectize_base_id')
const params = computed(() => props.params ?? {})

// Merge de config
const mergedConfig = computed(() => ({
    ...defaultConfig,
    ...props.config,
}))

onMounted(() => { 
    emit('mounted')
    if (!mergedConfig.value.getRowsOnDemand) { getRows() } 
})

defineExpose({ getRows, reset })
function getRows(paramsParam = {}) {
    var paramsFinal = paramsParam ? { ...params.value, ...paramsParam } : props.params;
    var url = props.customUrl && props.customUrl !== '' 
        ? props.customUrl 
        : (mergedConfig.value.useIndex ? props.model : `${props.model}/select`);
    
    axios(url, { params: paramsFinal})
        .then(response => {
            rows.value = response.data;
            $("#" + props.id+RANDOM_ID).selectize()[0]?.selectize?.destroy();
            $("#" + props.id+RANDOM_ID).selectize({
                valueField: 'id',
                labelField: 'name',
                searchField: ['name'],
                options: rows.value,
                items: [model.value],
                onChange: function (valueSelected: string | number | null, isOnInitialize: boolean) { 
                    model.value = valueSelected  
                    text.value = valueSelected !== null ? this.options[valueSelected]?.name : '';
                }
            });
        })
}

function reset(){ 
    model.value = ''; 
    $("#" + id+RANDOM_ID).selectize()[0]?.selectize?.clear();
}
</script>

<template>
    <label v-if="!mergedConfig.withoutLabel" class="form-label" :for="id+RANDOM_ID"><slot></slot></label>
    <select class="form-control" :class="{'form-control-sm': mergedConfig.sm}" :name="name" :id="id+RANDOM_ID" v-model="model"></select>
</template>