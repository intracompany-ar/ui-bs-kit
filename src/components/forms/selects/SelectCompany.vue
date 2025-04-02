<script setup lang="ts">
import { ref } from 'vue'
import { onMounted } from 'vue'

const model = defineModel()

const props = defineProps({
    name: { required: false, type: String, default: 'company_id' },
    id: { required: false, type: String, default: 'company_id' },

    config: {
        required: false, type: Object, default() { return {
            incluyeTodos: false,
            formFloating: false,
            required: false,
            useTributaryId: false,
            officialName: false,
            sm: false,
            withoutLabel: false
        }}
    },

    company_group_id: { required: false, type: [Number, String], default: '0' },
    condicionIvaId: { required: false, type: Number, default: 0 },

    appendOptions: { required: false, type: Array, default() { return [] } },
});

const rows = ref([]);

onMounted(() => { getRows(); })

defineExpose({ getRows })
function getRows() {
    axios('company/select', {params:{ company_group_id: props.company_group_id, condicionIvaId: props.condicionIvaId }})
        .then(response => {
            rows.value = response.data
            // Dejo seleccionada la primera opción, sino queda en blanco
            if (document.getElementById(props.id)) {
                document.getElementById(props.id).value = $("#" + props.id + " option:first").val();
            }
        })
}
</script>


<template>
    <div :class="{ 'form-floating': props.config.formFloating }">
        <label v-if="!props.config.formFloating && !props.config.withoutLabel" :for="props.id" class="form-label"><slot>Empresa</slot></label>

        <select class="form-control" :class="{ 'form-control-sm': props.config.sm }"  :id="props.id" :name="props.name" :required="props.config.required" v-model="model">
            <option :value="0" v-if="props.config.incluyeTodos" selected>Todas</option>
            
            <template v-for="row in rows" :key="row.id">
                <option :value="props.config.useTributaryId ? row.tributary_id : row.id">
                    {{ props.config.officialName ? row.official_name : row.name }}
                </option>
            </template>

            <option v-for="additional in props.appendOptions" :value="additional.value" :key="additional.id">
                {{ additional.label }}
            </option>
        </select>

        <label v-if="props.config.formFloating" class="form-label" :for="props.id"><slot>Empresa</slot></label>
    </div>
</template>