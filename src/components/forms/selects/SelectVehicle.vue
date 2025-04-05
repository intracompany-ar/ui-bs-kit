<script setup lang="ts">
import { ref } from 'vue'
import { onMounted } from 'vue'
import axios from 'axios'

const model = defineModel();

const props = defineProps({
    name: { required: false, default: 'vehicle_id', type: String },
    id: { required: false, type: String, default: 'vehicle_id' },

    incluyeTodos: { required: false, default: false, type: Boolean },
    labelValueCero: { required: false, type: String, default: 'Todas' },
    
    small: { required: false, type: Boolean, default: true },
    valueSelected: { required: false },
    loadOnMounted: { required: false, type: Boolean, default: true },
    config: { required: false, type: Object, default: () => { return { 
        useRegistrationPlate: false 
    }
    } }
});

interface Vehicle {
    id: number;
    registration_plate: string;
    brand?: { name: string };
    model?: { name: string };
}

const rows = ref<Vehicle[]>([])

onMounted(() => { if (props.loadOnMounted) { getRows() }; })

function getRows() {
    axios('vehicle/getMyFleet')
        .then(response => {
            rows.value = response.data;
            // Dejo seleccionada la primera opción, sino queda en blanco
            const element = document.getElementById(props.id) as HTMLSelectElement;
            if (element) {
                element.value = document.querySelector(`#${props.id} option:first`)?.getAttribute('value') || '';
            }
        })
}
</script>


<template>
    <label class="form-label" :for="props.id"><slot>Vehículo</slot></label>
    <select class="form-control" :class="{ 'form-control-sm': props.small }" :name="props.name" :id="props.id" v-model="model">

        <option value="0" v-if="props.incluyeTodos">{{ props.labelValueCero }}</option>
        <option v-for="row in rows" :value="props.config.useRegistrationPlate ? row.registration_plate : row.id" :key="row.id">
            {{ row.registration_plate }} {{ row.brand ? row.brand.name : '' }} {{ row.model ? row.model.name : '' }}
        </option>
    </select>
</template>