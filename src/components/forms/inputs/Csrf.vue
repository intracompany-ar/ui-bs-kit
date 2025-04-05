<!-- Este no lo estoy usando en ningún lado, no vale la pena, conviene poneer el input directamente con el csrf -->
<script setup lang="ts">
import { ref, onMounted } from 'vue'

const csrf = ref(0);

onMounted(() => {
    const metaTag = document.head.querySelector('meta[name="csrf-token"]') as HTMLMetaElement | null;
    csrf.value = metaTag?.content ? parseInt(metaTag.content, 10) || 0 : 0;
});
</script>

<template>
    <input type="hidden" name="_token" v-model="csrf" />
</template>