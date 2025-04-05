<script setup lang="ts">
import { isEmail } from '@intracompany/commons_front'

const emit = defineEmits(['editMail', 'editPhoneNumber'])
const props = defineProps({
    name: { required: false, type: String, default: 'N/N' },
    tributary_id: { required: false, type: [String, Number], default: '' },
    mail_address: { 
        required: false, 
        type: Object as () => { mail: string; existe: string }, 
        default: () => ({ mail: '', existe: '' }) 
    },
    phoneNumber: { 
        required: false, 
        type: Object as () => { exists: string; phone_number: string } | null, 
        default: null 
    },
    edit: { required: false, type: Boolean, default: false }
});
</script>

<template>
    <div style="font-size: 0.8em;">
        {{ props.name }}

        <span class="text-muted">({{ props.tributary_id }})</span>

        <div class="text-muted" v-if="props.mail_address">
            <div v-if="isEmail(props.mail_address.mail)">
                <div v-if="props.mail_address.existe == 'NO'">
                    <div style="color: red;">Mail Inexistente: {{ props.mail_address.mail }}</div>
                </div>

                <div v-else>
                    {{ props.mail_address.mail }}
                </div>
            </div>
            <div v-else style="color: red;">
                Formato Mail Incorrecto: {{ props.mail_address.mail }}
            </div>
        </div>

        <div style="color: red;" v-else>
            Sin mail
        </div>
        
        <div v-if="props.phoneNumber">
            <span v-if="props.edit" v-on:click.prevent="emit('editMail')"><i class="fa fa-edit"></i></span>
            <div class="text-muted">
                <div v-if="props.phoneNumber.exists == 'NO'">
                    <div style="color: red;">Tél Inexistente: {{ props.phoneNumber.phone_number }}</div>
                </div>
                <div v-else>
                    {{ props.phoneNumber.phone_number }}
                </div>
            </div>
        </div>

        <div style="color: red;" v-else>
            Sin teléfono
        </div>

        <span v-if="props.edit" v-on:click.prevent="emit('editPhoneNumber')"><i class="fa fa-edit"></i></span>
    </div>
</template>