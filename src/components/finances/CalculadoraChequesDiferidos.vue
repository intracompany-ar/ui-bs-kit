<script setup lang="ts">
import { ref, computed } from "vue"
import { tir, round, tnavToTnaa, tnaaToTnav, tnavToTndv, tasaRecargada_to_tnav, tasaRecargada_to_tea } from '@intracompany/commons_front'
import dayjs from "dayjs"

// https://www.mav-sa.com.ar/productos/derechos-para-operaciones-de-mercado/
const TASA_DERECHO_MERCADO_COMPRA = 0.0003; // +iva s/importe descontado
const TASA_DERECHO_MERCADO_VENTA = 0.0003; // 0.0006; dice en pag oficial ,quizá incluye el del listado también, 0.0003 usan en excel de IAMC // +iva s/importe descontado
const TASA_DERECHO_DE_LISTADO_VENTA = 0.0003;
const DIAS_MAX_PRORRATEO_DERECHO_MERCADO = 90;
const TASA_IVA = 0.21;
const DIAS_ANIO = 365;

const tasaDescuento = ref<number>(29);
const importeNominal = ref<number>(100000)
const fechaVencimiento = ref(dayjs().add(45, "day").format('YYYY-MM-DD'));
const fechaNegociacion = ref(dayjs().format("YYYY-MM-DD"));
const fechaLiquidacion = ref(dayjs(fechaNegociacion.value).add(1, 'day').format('YYYY-MM-DD')); // T+1: 24hs bursatiles luego de la fecha de concertó);
const tnavPorcDelCpd = ref<number>(29);
const porcArancelAgenteByma = ref<number>(1);
const condicionIvaComprador = ref<number>(1);

const diasAlVencimiento = computed((): number => {
    const a = dayjs(fechaVencimiento.value);
    const b = dayjs(fechaLiquidacion.value);
    return isNaN(a.diff(b, "day")) ? 0 : a.diff(b, "day");
});

const importeADescontarSobreValorNominal = computed<number>(() => {
    let tasaNetaADescontarVencida: number = Number(tnavToTndv(Number(tnavPorcDelCpd.value) / 100)) * Number(diasAlVencimiento.value);
    return Number(importeNominal.value) * tnavToTnaa(tasaNetaADescontarVencida);
});

const montoEfectivoCPD = computed<number>(() => {
    const importeNominalValue: number = Number(importeNominal.value || 0);
    const importeADescontarValue: number = Number(importeADescontarSobreValorNominal.value || 0);
    return importeNominalValue - importeADescontarValue;
});

const importeArancelAgenteByma = computed<number>(() => {
    let base = (importeNominal.value * diasAlVencimiento.value) / 365;
    return (base * porcArancelAgenteByma.value) / 100;
});

/////////// COMPRADOR
// Sobre el valor efectivo del CPD, prorrateable por hasta 90 días, es decir, si lo días son menos de 30 => se toma el proporcional a 90, ejemplo, a 30 días => 30/90 es 30% => solo se paga el 0.33 en lugar de 0.0003
const derechoMercado = computed(() => {
    let tasaDerecho = diasAlVencimiento.value < DIAS_MAX_PRORRATEO_DERECHO_MERCADO
        ? (diasAlVencimiento.value / DIAS_MAX_PRORRATEO_DERECHO_MERCADO) * TASA_DERECHO_MERCADO_COMPRA
        : TASA_DERECHO_MERCADO_COMPRA;

    let tasaDerechoVenta =
        Number(diasAlVencimiento.value) < DIAS_MAX_PRORRATEO_DERECHO_MERCADO
            ? (Number(diasAlVencimiento.value) / DIAS_MAX_PRORRATEO_DERECHO_MERCADO) *
            TASA_DERECHO_MERCADO_VENTA
            : TASA_DERECHO_MERCADO_VENTA;
    return {
        vendedor: tasaDerechoVenta * parseFloat(String(montoEfectivoCPD.value)),
        comprador: tasaDerecho * parseFloat(String(montoEfectivoCPD.value))
    }
});


const tEfectivaDelPeriodo = computed(() => {
    let tasaEfectiva = importeNominal.value / importe.value.comprador - 1;
    let tasaEfectiva2 = importeNominal.value / importe.value.vendedor - 1;
    return {
        comprador: round(tasaEfectiva * 100),
        vendedor: round(tasaEfectiva2 * 100)
    }
});


/**
 * Gestos de negociación
 */
const derechoListado = computed<number>(() => { return TASA_DERECHO_DE_LISTADO_VENTA * importeNominal.value });

const gastosNegociacion = computed((): { vendedor: number; comprador: number } => {
    return {
        vendedor: derechoMercado.value.vendedor + derechoListado.value + importeArancelAgenteByma.value,
        comprador: derechoMercado.value.comprador + importeArancelAgenteByma.value
    };
});

const iva = computed((): { vendedor: number; comprador: number } => {
    return {
        vendedor: TASA_IVA * Number(gastosNegociacion.value.vendedor),
        comprador: TASA_IVA * Number(gastosNegociacion.value.comprador)
    }
});

const importe = computed((): { vendedor: number; comprador: number } => {
    return {
        vendedor: Number(montoEfectivoCPD.value) - Number(iva.value.vendedor) - Number(gastosNegociacion.value.vendedor),
        comprador: Number(montoEfectivoCPD.value) + Number(gastosNegociacion.value.comprador) + Number(iva.value.comprador || 0)
    };
});

const percIVA = computed<number>(() => {
    return Number(round(TASA_IVA * Number(importeADescontarSobreValorNominal.value)));
});

const tnavPorcConGastosImpuesto = computed((): { vendedor: number; comprador: number } => {
    let tasaDescontada = 1 - importe.value.vendedor / importeNominal.value; 
    let tnav = (tnaaToTnav(tasaDescontada) / Number(diasAlVencimiento.value)) * DIAS_ANIO;

    let tasaRecargada = importeNominal.value / Number(importe.value.comprador) - 1; // Lo que voy a cobrar / lo que pago hoy
    let tnav2 = !isNaN(diasAlVencimiento.value) ? tasaRecargada_to_tnav(tasaRecargada, diasAlVencimiento.value) : 0;
    return {
        vendedor: tnav * 100,
        comprador: Number(tnav2) * 100
    }
});


const teaEquivalente = computed((): { vendedor: number; comprador: number }  => {
    // Lo que podria haber cobrar / lo que cobro hoy
    let tasaRecargada = importeNominal.value / importe.value.vendedor;

    // Lo que voy a cobrar / lo que pago hoy
    let tasaRecargada2 = importeNominal.value / importe.value.comprador;

    return {
        vendedor: tasaRecargada_to_tea(tasaRecargada, Number(diasAlVencimiento.value) * 100),
        comprador: tasaRecargada_to_tea(tasaRecargada2, (Number(diasAlVencimiento.value) || 0) * 100)
    }
});
//^^^^^^^^^^ VENDEDOR
</script>

<template>
    <div class="container bg-secondary bg-opacity-25">
        <div class="row">
            <div class="col-12 col-md-6 p-1">
                <div class="row">
                    <h4>Cheque</h4>
                    <div class="col-6">
                        <label for="importeNominal">$ Imp Nominal:</label>
                        <input type="number" class="form-control" id="importeNominal" name="importeNominal" max="1000000000"
                            min="0" v-model="importeNominal" />
                    </div>
                    <div class="col-6">
                        <label for="fechaVencimiento">Fecha Vto Cheque:</label>
                        <input type="date" class="form-control" id="fechaVencimiento" name="fechaVencimiento"
                            v-model="fechaVencimiento" />
                        <small class="text-muted"><small>{{ diasAlVencimiento }} días al vencimiento</small></small>
                        <br>
                        <small class="text-muted"><small>{{ diasAlVencimiento + 1 }} días a la liquidación</small></small>
                    </div>
                </div>
            </div>
        </div>

        <div class="row">
            <div class="col-12 col-md-6 p-1 border border-4 rounded">
                <div class="row">
                    <h4>Negociación</h4>
                    <div class="col-6 mb-2">
                        <label for="fechaNegociacion">Fecha Negociación (T):</label>
                        <input type="date" class="form-control" id="fechaNegociacion" name="fechaNegociacion"
                            v-model="fechaNegociacion" />
                    </div>

                    <div class="col-6 mb-2">
                        <label for="fechaLiquidacion">Fecha Liquida (T+1):</label>
                        <input type="date" class="form-control" id="fechaLiquidacion" name="fechaLiquidacion"
                            v-model="fechaLiquidacion" />
                    </div>

                    <div class="col-12 col-md-6">
                        <label for="condicionIvaComprador">Cond IVA del comprador:</label>
                        <select class="form-control" id="condicionIvaComprador" name="condicionIvaComprador"
                            v-model="condicionIvaComprador">
                            <option value="1">Inscripto</option>
                            <option value="2">No Inscripto</option>
                            <option value="3">Exento</option>
                        </select>
                    </div>

                    <div class="col-6">
                        <label for="tnavPorcDelCpd">TNAV (%)</label>
                        <input type="number" class="form-control" id="tnavPorcDelCpd" name="tnavPorcDelCpd" max="1000"
                            min="0" v-model="tnavPorcDelCpd" />
                        TNAA {{ round(tnavToTnaa(tnavPorcDelCpd / 100) * 100) }} %
                    </div>

                    <div class="col-6 mt-2">
                        <label for="porcArancelAgenteByma">Arancel Agente Byma (% anual)</label>
                        <input type="number" class="form-control" id="porcArancelAgenteByma" name="porcArancelAgenteByma"
                            max="1000" min="0" v-model="porcArancelAgenteByma" />
                    </div>
                </div>
            </div>
        </div>

        <hr>

       

        <div class="row">

            <div class="col-12">

                <table class="table table-borderd">
                    <tbody>
                        <tr>
                            <th>Importe Nominal CPD </th>
                            <td colspan="2">$ {{ importeNominal }}</td>
                        </tr>
                        <tr>
                            <th>Descuento</th>
                            <td colspan="2">$ {{ importeADescontarSobreValorNominal }} <small class="text-muted">{{ round(100*importeADescontarSobreValorNominal /importeNominal ,2) }}% </small></td>
                        </tr>
                        <tr>
                            <th>Bruto a cobrar / pagar </th>
                            <td colspan="2">$ {{ montoEfectivoCPD }}</td>
                        </tr>
                        <tr class="table-dark">
                            <th></th>
                            <th>Vendedor</th>
                            <th>Comprador</th>
                        </tr>

                        <tr>
                            <th>Gastos de Negociación</th>
                            <td>-$ {{ gastosNegociacion.vendedor }}
                                <br>
                                <small class="text-muted">
                                    - Derecho de Mercado $ {{ round(derechoMercado.vendedor) }}
                                    <br>
                                    - Arancel BYMA Agente $ {{ round(importeArancelAgenteByma) }}
                                    <br>
                                    - Derecho de Listado $ {{ round(derechoListado) }} (0.03% Importe Nominal del CPD)

                                </small>
                            </td>
                            <td>-$ {{ gastosNegociacion.comprador }}
                                <br>
                                <small class="text-muted">
                                    + Derecho de Mercado ${{ Math.round(derechoMercado.comprador * 100) / 100 }}
                                    ({{ TASA_DERECHO_MERCADO_VENTA * 100 }} %
                                    sobre el valor efectivo del CPD, prorrateable por hasta 90 días)
                                    <br>+ Arancel Agente BYMA ${{ Math.round(importeArancelAgenteByma * 100) / 100 }} ({{
                                        porcArancelAgenteByma }}% anual sobre el valor nominal del CPD)
                                </small>
                            </td>
                        </tr>

                        <tr class="table-danger">
                            <th>IVA sobre G.negociación</th>
                            <td>-$ {{ iva.vendedor }}</td>
                            <td>-$ {{ iva.comprador }}</td>
                        </tr>

                        <tr class="table-warning" v-if="condicionIvaComprador != 3">
                            <th>Perc. IVA</th>
                            <td>-${{ round(percIVA) }}</td>
                            <td></td>
                        </tr>

                        <tr v-if="condicionIvaComprador != 3">
                            <th>Arancel Custodia Caja de Valores</th>
                            <td></td>
                            <td class="text-muted">0.25% anual prorratead por los días en custodia</td>
                        </tr>

                        <tr class="border-dark border-top border-2">
                            <th>Neto a cobrar / pagar</th>
                            <th>$ {{ round(importe.vendedor - percIVA) }}</th>
                            <th>$ {{ importe.comprador }}</th>
                        </tr>

                        <tr class="table-warning" v-if="condicionIvaComprador != 3">
                            <th>Recupero Perc. IVA</th>
                            <td>${{ round(percIVA) }}</td>
                            <td></td>
                        </tr>

                        <tr class="table-danger" v-if="condicionIvaComprador != 3">
                            <th>Recupero IVA</th>
                            <td>${{ round(Number(iva.vendedor) || 0) }}</td>
                            <td>${{ round(iva.comprador) }}</td>
                        </tr>

                        <tr class="table-success fw-bold border-dark border-top border-4">
                            <th>Ingresos a cobrar / pagar</th>
                            <td>$ {{ round(importe.vendedor + iva.vendedor) }}</td>
                            <td>$ {{ round(importe.comprador + iva.comprador) }}</td>
                        </tr>


                        <tr>
                            <th>TNAV incluyendo gastos e imp</th>
                            <td>{{ tnavPorcConGastosImpuesto.vendedor }}%</td>
                            <td>{{ tnavPorcConGastosImpuesto.comprador }} %</td>
                        </tr>

                        <tr>
                            <th>Tasa efectiva del período:</th>
                            <td>{{ tEfectivaDelPeriodo.vendedor }}%</td>
                            <td>{{ tEfectivaDelPeriodo.comprador }}%</td>
                        </tr>
                        <tr>
                            <th>Tasa efectiva anual equivalente:</th>
                            <td>{{ teaEquivalente.vendedor }}%</td>
                            <td>{{ teaEquivalente.comprador }}%</td>
                        </tr>
                    </tbody>
                </table>
            </div>

        </div>


        <div class="row">
            <div class="col-12 col-md-4">
                <h3>Cash Flow Bruto Vendedor</h3>
                <table class="table table-borderd">
                    <thead class="table-dark">
                        <tr>
                            <th>Períodos</th>
                            <th>0</th>
                            <th>Dias</th>
                            <th>{{ diasAlVencimiento }}</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <th>Flujos</th>
                            <td>$ {{ montoEfectivoCPD }} </td>
                            <td></td>
                            <td>-${{ importeNominal }}</td>
                        </tr>
                        <tr>
                            <th>Flujos</th>
                            <td>$ {{ montoEfectivoCPD }} </td>
                            <td></td>
                            <td>-${{ Math.round(100 *
                                importeNominal / (
                                    1 + (tasaDescuento / 100) / DIAS_ANIO) ** (diasAlVencimiento)) / 100
                            }}</td>
                        </tr>
                    </tbody>
                </table>


                <table class="table table-borderd">
                    <tbody>
                        <tr>
                            <th>WACC / Tasa Descuento [%]</th>
                            <td><input type="number" class="form-control" v-model="tasaDescuento"></td>
                        </tr>
                        <tr>
    
                            <th>TIR</th>
                            <td>{{ Math.round(tir([-1 * montoEfectivoCPD, (importeNominal / (1 + (tasaDescuento / 100) /
                                DIAS_ANIO) **
                                (diasAlVencimiento ))]) * 100) / 100 }}%
                            </td>
                        </tr>
                        <tr>
                            <th>VAN</th>
                            <td>{{ Math.round(100 * (montoEfectivoCPD - (importeNominal / (1 + (tasaDescuento / 100) /
                                DIAS_ANIO) **
                                (diasAlVencimiento )))) / 100 }}
                            </td>
                        </tr>
                    </tbody>
                </table>

                <div>Desc. sobre VN del CPD {{
                    Math.round(importeADescontarSobreValorNominal / montoEfectivoCPD * 10000) / 100
                }}%</div>
            </div>
        </div>
    </div>
</template>
