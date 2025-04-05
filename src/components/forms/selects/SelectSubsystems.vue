<script setup lang="ts">
import { ref } from 'vue'
import { watch } from 'vue'
import { onMounted } from 'vue'
import axios from 'axios'
const emit = defineEmits(['cargafinalizada', 'update:modelValue']);

const props = defineProps({
    name: { required: false, default: 'select_subsystems', type: String },
    id: { required: false, default: 'select_subsystems', type: String },

    modelValue: { required: false },
    incluyeTodos: { required: false, default: 'false', type: [String, Boolean] }
})

const subsystems = ref<{ id: number; name: string }[]>([])
const modelValue = ref(props.modelValue);

onMounted(() => { getRows(); })

watch(() => props.modelValue, async () => { modelValue.value = props.modelValue })

function getRows() {
    axios('subsystem/select')
        .then(response => { subsystems.value = response.data; })
        .then(() => { emit('cargafinalizada'); });
}
</script>

<template>
    <label class="form-label" :for="props.id">Subsistema</label>
    <select :name="props.name" class="form-control form-control-sm" :id="props.id"
        v-on:change="emit('update:modelValue', ($event.target as HTMLSelectElement)?.value || '')" v-model="modelValue">

        <option value="0" selected v-if="props.incluyeTodos == 'true'">Todas</option>
        <option v-for="subsystem in subsystems" :value="subsystem.id" :key="subsystem.id">{{ subsystem.name }}</option>
    </select>
</template>