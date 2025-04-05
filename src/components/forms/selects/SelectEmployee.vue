<script setup lang="ts">
import { ref } from 'vue'
import { watch } from 'vue'
import { onMounted } from 'vue';
import axios from "axios";

const model = defineModel();
const text = defineModel('text')

const props = defineProps({
    name: { required: false, default: 'filtro_employment', type: String },
    id: { required: false, default: 'filtro_employment', type: String },

    incluyeTodos: { required: false, default: 'false', type: [String, Boolean] },
    customUrl: { required: false, default: '', type: String },

    sucursal_id: { required: false, default: 0, type: [String, Number] },

    small: { required: false, type: Boolean, default: true },
    config: {
        required: false, type: Object, default: () => ({
            useId: false,
            getOnDemand: false
        })
    }
});

interface Employment {
    id: number;
    entity_id: number;
    name: string;
}

const rows = ref<Employment[]>([]);

watch(() => props.sucursal_id, () => { getRows() });

onMounted(() => { if(!props.config.getOnDemand){ getRows() }});

defineExpose({ getRows })
function getRows() {
    let url: string;
    let params: { sucursalId?: string | number } = {};

    if(props.customUrl == '') {
        url = 'employment/select';
        params = { sucursalId: props.sucursal_id };
    } else {
        url = props.customUrl;
    }
    axios(url, {params: params})
        .then(response => {
            rows.value = response.data;
            setDefaultOption();
        })
}

function setDefaultOption() {
    const selectElement = document.getElementById(props.id) as HTMLSelectElement;
    if (selectElement && selectElement.options?.length > 0) {
        selectElement.value = selectElement.options[0].value;
    }
}
</script>


<template>
    <label class="form-label" :for="props.id"><slot>Empleado</slot></label>
    <select :name="props.name" class="form-control" :id="props.id" :class="{ 'form-control-sm': small }" v-model="model"
        v-on:change="text = ((<HTMLSelectElement>$event.target)?.options?.[(<HTMLSelectElement>$event.target).selectedIndex]?.text || '')"
    >

        <option value="0" selected v-if="incluyeTodos == 'true'">Todas</option>

        <option v-for="employment in rows" :value="props.config.useId ? employment.id : employment.entity_id" :key="employment.id">
            {{ employment.name }}
        </option>
    </select>
</template>