<script setup lang="ts">
import { showAdvice } from '@intracompany/commons_front'

defineProps({
    file_id: { required: false, type: [Number, String], default: null },
    name: { required: true, type: String },
    label: { required: false, type: String, default: null },
    src: { required: false, type: String, default: '' },
    alt: { required: false, type: String, default: 'imagen' }
})

function eliminar() {
    if (confirm('Seguro desea eliminar este file?')) {
        axios.delete(route('file.destroy', props.file_id))
            .then(response => {
                src.value = '';
                file_id.value = '';
                showAdvice('success', response.data);
            })
    }
}
</script>

<template>
    <div>
        <div v-if="file_id">
            <a v-bind:href="src" target="_blank" rel="noreferrer noopener">
                <img v-bind:src="src" id="imagen" class="rounded float-start" v-bind:alt="alt" width="200">
            </a>

            <a href="#" v-on:click.prevent="eliminar">Eliminar</a>
        </div>

        <div v-else>
            <label for="name" v-if="label">{{ label }}</label>
            <input type='file' v-bind:name="name" class="form-control form-control-sm" v-bind:id="name" accept="image/*">
        </div>
    </div>
</template>