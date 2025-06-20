<script setup lang="ts">
import { ref } from 'vue'
import { showAdvice } from '@intracompany/commons_front'
import axios from 'axios'
// import { configDefaultDatatable } from './../defaults/datatable';
// import $ from 'jquery';
// import 'datatables.net';
import DataTable from 'datatables.net-bs5';
import type { Api } from 'datatables.net';
// $.extend(true, $.fn.dataTable.defaults, configDefaultDatatable);

const emit = defineEmits(['openModalShow']);

const RANDOM_ID = Math.round(Math.random() * 10000000);

const modoEdit = ref(false)
const father_id = ref(0)
const tabla = ref<Api | null>(null)
const paramsGet = ref({})
const rows = ref<any[]>([]) // Define rows as a reactive array

const props = defineProps({
    id: { required: true, type: String }, // Tmb la uso para los id de la table

    model: { required: true, type: String },
    parameterRouteName: { required: false, type: String, default: 'id' },
    parameterRouteValue: { required: false, type: Number, default: 0 },

    // Requiere que una columna sea value id para que funcione el delete
    columns: { 
        required: true, 
        type: Array as () => Array<{ value: string; title: string; valorFijo?: string; type?: string; selectOptions?: Array<{ id: string; name: string }>; valueAux?: string }>, 
    },
    datatable: { required: false, type: Boolean, default: false },
    selectOptions: { required: false, type: [Array, Object], default() { return [] } },
    fatherField: { required: false, type: String, default: '' },

    modalShow: { required: false, type: Boolean, default: false },

    config: { required: false, type: Object, default() { return {
        crud: false,
        show: false,
    } } }
})

defineExpose({ getRows, resetInputs, resetRows, destroyTable })
function getRows(paramsGetParam = {}) {
    paramsGet.value = paramsGetParam;
    let url = props.model;
    if (props.parameterRouteName) {
        url = url.replace(':' + String(props.parameterRouteName), String(props.parameterRouteValue))
            .replace('%3A' + props.parameterRouteName, String(props.parameterRouteValue));
    };

    axios(url, { params: paramsGet.value })
        .then(response => {
            try {
                rows.value = JSON.parse(response.data)
            } catch (error) {
                rows.value = response.data
            }
        })
        .then(() => { 
            if (props.datatable && tabla) { 
            const tableElement = document.querySelector('#table_' + props.id + RANDOM_ID) as HTMLElement;
            if (tableElement) {
                tabla.value = $(tableElement).DataTable({
                    buttons: []
                }) as Api;
            }
        } })
}

function resetRows() { rows.value = [] }

function destroyTable() {
    if (props.datatable && tabla && tabla.value) {
        tabla.value.destroy()
    }
}

function resetInputs() {
    props.columns.forEach((columna: { value: string; valorFijo?: string }) => {
        const inputId = `#${props.id}_${columna.value}`;
        const inputElement = document.querySelector<HTMLInputElement>(inputId);

        if (inputElement && columna.valorFijo !== undefined) {
            console.debug('Set valor fijo', columna.valorFijo);
            inputElement.value = columna.valorFijo;
        }
    });
} 

function pasarAModoAdd(father_idParam = 0) {
    father_id.value = father_idParam;
    resetInputs();
    modoEdit.value = false;
}

function pasarAEdicion(row: Record<string, any>) {
    modoEdit.value = true;
    props.columns.forEach(columna => {
        let el = document.querySelector('#' + props.id + '_' + columna.value);
        if (el) { (el as HTMLInputElement).value = row[columna.value]; }
    });
}

function store() {
    let formData: Record<string, any> = {};
    props.columns.forEach(columna => {
        let el = document.querySelector('#' + props.id + '_' + columna.value);
        if (el) { formData[columna.value] = (el as HTMLInputElement).value; }

        if (props.fatherField != '') {
            formData[props.fatherField] = father_id.value;
        }
    });
    axios.post(props.model, formData)
        .then(() => {
            if (props.datatable && tabla && tabla.value) { tabla.value.destroy() }
            getRows(paramsGet.value);
            resetInputs()
        });
}

function editRow() {
    let formData: Record<string, any> = {};

    props.columns.forEach(columna => {
        let el = document.querySelector('#' + props.id + '_' + columna.value);
        if (el) { formData[columna.value] = (el as HTMLInputElement).value; }
    });

    let urlEdit = props.model;

    axios.put(urlEdit+'/'+formData[props.parameterRouteName], formData)
        .then(response => {
            showAdvice('success', 'Elemento actualizado');
            if (props.datatable && tabla && tabla.value) { tabla.value.destroy() }
            getRows(paramsGet.value);
            pasarAModoAdd();
        })
}

function deleteRow(id: string | number) {
    if (confirm('Seguro desea eliminar este elemento?')) {
        let urlDelete = props.model;
        axios.delete(urlDelete+'/'+id)
            .then(response => {
                showAdvice('success', 'Elemento eliminado');
                if (props.datatable && tabla && tabla.value) { tabla.value.destroy() }
                getRows(paramsGet.value);
                pasarAModoAdd();
            })
    }
}

function evaluarVariableString(row: Record<string, any>, valueAux: string) {
    let arrayValueAux = valueAux.split('.');
    return row[arrayValueAux[0]] ? row[arrayValueAux[0]][arrayValueAux[1]] : '';
}
</script>

<template>
    <table :id="'table_' + props.id + RANDOM_ID" class="table table-sm table-striped table-hover table-bordered compact"
        width="100%" cellspacing="0" border="1">
        <thead>
            <tr>
                <td v-for="(columna, index) in columns" :key="index">
                    <div v-if="father_id != 0">
                        Hijo de {{ father_id }}

                        <a href="#" v-on:click.prevent="father_id = 0" class="btn btn-primary btn-sm">
                            <i class="fas fa-times"></i></a>
                    </div>

                    <input v-if="['hidden', 'text', 'number', 'date'].includes(columna.type || '')"
                        class="form-control form-control-sm" :type="columna.type"
                        :id="props.id + '_' + columna.value">

                    <select v-if="columna.type == 'select'" class="form-control form-control-sm"
                        :id="props.id + '_' + columna.value">
                        <option v-for="option in columna.selectOptions" :value="option.id">{{ option.name }}</option>
                    </select>
                </td>

                <td>
                    <a href="#" v-on:click.prevent="store" class="btn btn-success" v-show="!modoEdit">
                        <i class="fas fa-save"></i></a>

                    <a href="#" v-on:click.prevent="editRow" class="btn btn-success btn-sm"
                        v-show="modoEdit">
                        <i class="far fa-edit"></i></a>

                    <a href="#" v-on:click.prevent="pasarAModoAdd()" class="btn btn-danger btn-sm"
                        v-show="modoEdit">
                        <i class="fas fa-times"></i></a>
                </td>

            </tr>

            <tr class="thead-inverse">
                <th scope="col" v-for="(columna, index) in columns" :key="index">{{ columna.title }}</th>
                <th></th>
            </tr>

        </thead>

        <tbody>
            <tr v-for="(row, index) in rows" :key="index">
                <td v-for="(columna, index) in columns" :key="index">
                    <div v-if="columna.valueAux">
                        {{ evaluarVariableString(row, columna.valueAux) }}
                    </div>
                    <div v-else>
                        {{ row[columna.value] }}
                    </div>
                </td>

                <td>
                    <a href="#" v-on:click.prevent="pasarAEdicion(row)">
                        <i class="fas fa-edit"></i></a>
                    &nbsp;
                    <a href="#" v-on:click.prevent="deleteRow(row[props.parameterRouteName])">
                        <i class="fas fa-trash-alt"></i></a>
                    &nbsp;

                    <a v-if="props.modalShow" v-on:click.prevent="emit('openModalShow', row)" href="#">
                        <i class="fas fa-eye"></i>
                    </a>

                    <router-link v-if="props.config.show" :to="'/'+props.model+'/'+row[props.parameterRouteName]" >
                        <i class="fas fa-eye"></i>
                    </router-link>
                    &nbsp;
                    <a v-if="props.fatherField != ''" href="#" v-on:click.prevent="pasarAModoAdd(row[props.parameterRouteName])">
                        Agregar hijo
                    </a>
                </td>
            </tr>
        </tbody>
    </table>
</template>