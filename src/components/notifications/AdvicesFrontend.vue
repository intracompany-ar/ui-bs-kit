<script setup lang="ts">
import { watch, ref } from 'vue'
import { advice } from '@intracompany/commons_front'

const WITH_AUDIO = false;
const optionToast = ref({ animation: true, duration: 3000 })
const avisosDOM = ref<{ id: string, type: string, title: string, content: string }[]>([])

ocultarAvisoBackEnd();

watch(advice, async (val) => {
    if (val) {
        await pushAdvice(advice.value)
        advice.value = null
    }
}, { immediate: true })

// LIVEWIRE (usa avisos backend como si fueran frontends)
// document.addEventListener("DOMContentLoaded", () => {
//     if (typeof Livewire !== 'undefined') {
//         Livewire.hook('message.processed', (message, component) => {
//             ocultarAvisoBackEnd();
//         })
//     }
// });

function ocultarAvisoBackEnd() {
    const elementos = document.querySelectorAll('.alert-temporal')
    elementos.forEach(el => {
        (el as HTMLElement).style.transition = 'opacity 10s';
        (el as HTMLElement).style.opacity = '0'
        setTimeout(() => el.remove(), 10500)
    })
}

async function pushAdvice(advice: any) {

    let content = Array.isArray(advice.message) ? advice.message.join(', ') : advice.message

    const tipoMap: Record<string, string> = {
        info: 'Información',
        danger: 'Error',
        warning: 'Precaución',
        success: 'Éxito',
    }

    const id = `${advice.type.toLowerCase()}-${Math.floor(Math.random() * 1e7)}`
    let title = tipoMap[advice.title ?? advice.type] || advice.title || advice.type;

    if (Array.isArray(content)) {
        // TODO ver como hago un <ul><li></li></ul>
        console.warn('Falta implementar la lógica para contenido de tipo array');
        // return;
    };

    const type = advice.type; // Define 'type' from 'advice.type'
    avisosDOM.value.push({ type, title, content, id });

    setTimeout(() => { // Le tengo que dar tiempo a vue js que renderize el DOM
        let toastElement = document.getElementById(id);
        if (!toastElement) { return console.error('No existe el elemento con id', id); }

        toastElement.style.display = 'block'; // Muestra el toast estableciendo el estilo display a 'block'

        // Opcional: Personaliza otros estilos según tus necesidades
        // toastElement.style.position = 'fixed';
        // toastElement.style.bottom = '20px';
        // toastElement.style.left = '50%';
        // toastElement.style.transform = 'translateX(-50%)';

        // Cierra el toast después de cierto tiempo (ajusta según tus necesidades)
        setTimeout(() => {
            // Cuando se cierre el toast lo elimino del avisosDOM
            toastElement.style.display = 'none';
            avisosDOM.value = avisosDOM.value.filter(a => a.id !== id)
        }, optionToast.value.duration ?? 3000); // Duración predeterminada: 3000 ms (3 segundos)

        if (WITH_AUDIO) {
            const trackId = advice.type === 'danger' || advice.type === 'warning' ? 'notiferror' : 'notifcoldday'
            const trackElement = document.getElementById(trackId) as HTMLAudioElement | null;
            if (trackElement) {
                trackElement.play();
            } else {
                console.error('Audio element not found for trackId:', trackId);
            }
        };

    }, 500);
}

function cerrarToast(idParam: string){
    let el = document.getElementById(idParam)
    if (el) el.style.display = 'none'
}
</script>


<template>
    
    <!-- Toaster (avisos frontend Bootstrap). Modal es z-index: 1060 => a este pongo 1070 -->
    <div class="toast-container position-fixed top-0 end-0 p-3" id="toastContainer" style="z-index: 1070; margin-top: 70px">
        <div v-for="aviso in avisosDOM" class="toast align-items-center"
            v-bind:class="{   'text-white bg-primary': aviso.type == 'info',
                        'text-white bg-danger': aviso.type == 'danger',
                        'text-white bg-success': aviso.type == 'success',
                        'bg-warning': aviso.type == 'warning'
                    }"
            role="alert" aria-live="assertive" aria-atomic="true" 
            v-bind:id="aviso.id">
            <div class="toast-header">
                <strong class="me-auto">
                    <i class="fas fa-info-circle" v-if="aviso.type == 'info'"></i>
                    <i class="fas fa-exclamation-circle" v-if="aviso.type == 'danger'"></i>
                    <i class="fas fa-exclamation-triangle" v-if="aviso.type == 'warning'"></i>
                    <i class="far fa-check-circle" v-if="aviso.type == 'success'"></i>

                    {{ aviso.title }}
                </strong>
                <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close" @click="cerrarToast(aviso.id)"></button>
            </div>
            <div class="toast-body">{{ aviso.content }}</div>
        </div>
    </div>
</template>