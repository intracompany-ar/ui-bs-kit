<script setup lang="ts">
import { ref } from 'vue'
import { onMounted } from 'vue';

const model = defineModel();

const props = defineProps({
    id: { required: false, type: String, default: 'company_group_id' },
    name: { required: false, type: String, default: 'company_group_id' },
    incluyeTodos: { required: false, type: [String, Boolean], default: 'false' }
});

const rows = ref([]);

onMounted( () => { getRows() })

function getRows()
{
    axios( 'companyGroup')
        .then( response => {
            rows.value = response.data;
            if (document.getElementById(props.id)) {
                document.getElementById(props.id).value = $("#"+props.id+" option:first").val();
            }
        })
}
</script>


<template>
    <label class="form-label" :for="props.id">Grupo</label>

    <select :name="props.name" class="form-control form-control-sm" v-model="model" :id="props.id">
        <option selected :value="0" v-if="props.incluyeTodos"> Todas </option>
        <option v-for="row in rows" :value="row.id" :key="row.id">{{ row.name }}</option>
    </select>
</template>