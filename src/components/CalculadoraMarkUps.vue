<script setup lang="ts">
import { ref, computed } from 'vue'

const desc_proveed = ref<number>(-27)
const precio_lista = ref<number>(100)
const condition_table_discount = ref<number>(0)

const costo = computed(() => {
    return precio_lista.value * (100 + desc_proveed.value) / 100;
})

const mark_up_lista = computed(() => {
    return (precio_lista.value / costo.value) - 1;
})

const precio_rev_finz = computed(() => {
    return precio_lista.value * (100 + condition_table_discount.value) / 100;
})

const mark_up = computed(() => {
    return Math.round((precio_rev_finz.value / costo.value) * 100) - 100;
})
</script>


<template>
    <div class="container mt-4">
        <h3>Calculadora de MarkUps</h3>

        <div class="row">
            <div class="col-3">
                <label for="">Precio Lista:</label>
                <div class="input-group">
                    <div class="input-group-text">
                        <span class="input-group-addon">$</span>
                    </div>

                    <input type="number" class="form-control" v-model="precio_lista">

                </div>
            </div>

            <div class="col-3">
                <label for="">Desc. Proveedor sobre lista:</label>
                <div class="input-group">
                    <input type="number" class="form-control" v-model="desc_proveed">

                    <div class="input-group-text">
                        <span class="input-group-addon">%</span>
                    </div>
                </div>
            </div>
        </div>

        <div class="row">
            <div class="col-3">
                <label for="">Costo:</label>
                <div class="input-group">
                    <div class="input-group-text">
                        <span class="input-group-addon">$</span>
                    </div>
                    <input type="number" class="form-control" v-model="costo" readonly>

                </div>
            </div>

            <div class="col-3">
                <label for="">MarkUp Lista:</label>
                <div class="input-group">
                    <input type="number" class="form-control" v-model="mark_up_lista" readonly>

                    <div class="input-group-text">
                        <span class="input-group-addon">%</span>
                    </div>
                </div>
            </div>
        </div>


        <div class="row">
            <div class="col-3">
                <label for="">Precio Rev. Financiado:</label>
                <div class="input-group">
                    <div class="input-group-text">
                        <span class="input-group-addon">$</span>
                    </div>

                    <input type="number" class="form-control" v-model="precio_rev_finz" readonly>

                </div>
            </div>

            <div class="col-3">
                <label for="">Desc. grilla base (rev. financiado):</label>
                <div class="input-group">
                    <input type="number" class="form-control" v-model="condition_table_discount">

                    <div class="input-group-text">
                        <span class="input-group-addon">%</span>
                    </div>
                </div>
            </div>
        </div>

        <div class="row">
            <div class="col-6">
                <label for="">MarkUp Final</label>
                <div class="input-group">
                    <input type="number" class="form-control" v-model="mark_up" readonly>

                    <div class="input-group-text">
                        <span class="input-group-addon">%</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <br>

    <p>OBSERVACIÓN: Tener precaución con los plazos de pago de compra y venta, por ejemplo si a Fate pagamos 0/120
        entonces usar precio 0/120 nuestro, si quiero comparar por ejemplo contado contra contado, averiguar los
        descuentos de Fate por pronto pago. A Michelin pagamos contado, usar precio contado</p>
</template>