<!-- SI ES MODAL: Link es el Id del modal, modal="true", onclick nada a menos que tenga que ejecutar algún script -->
<script setup lang="ts">
import { computed } from 'vue';

const emit = defineEmits(['click']);
const props = defineProps({
    link: { required: false, type: [String, Object] },
    modal: { required: false, type: Boolean, default: false }
})

function isString(value: unknown): boolean {
    return typeof value === "string";
}

const isExternalLink = computed(() => isString(props.link) ? props.link?.startsWith('http') : false);
const isModal = computed(() => props.modal && props.link);
</script>

<template>
    <a v-if="isExternalLink" :href="isString(props.link) ? String(props.link) : undefined" accesskey="A" class="text-primary plus-icon" target="_blank" rel="noopener noreferrer">
        <i class="fa fa-plus-circle fa-3x" aria-hidden="true"></i>
    </a>
    <a v-else-if="isModal" :href="isString(props.link) ? String(props.link) : undefined" data-bs-toggle="modal" v-on:click="emit('click')" accesskey="A" class="text-primary plus-icon">
        <i class="fa fa-plus-circle fa-3x" aria-hidden="true"></i>
    </a>
    <router-link v-else-if="props.link && !props.modal" :to="props.link" class="text-primary plus-icon">
        <i class="fa fa-plus-circle fa-3x" aria-hidden="true"></i>
    </router-link>
    <a v-else v-on:click="emit('click')" accesskey="A"  class="text-primary plus-icon">
        <i class="fa fa-plus-circle fa-3x" aria-hidden="true"></i>
    </a>
</template>

<style scoped>
.plus-icon {
    cursor: pointer;
    
}
</style>