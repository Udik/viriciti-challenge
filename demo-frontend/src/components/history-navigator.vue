<template>
<div class="container">
    <div class="row">
        <div class="col">
            time period:<br>
            {{ date }} <br>
            {{ minTime }} - {{ maxTime }}
        </div>
    </div>
    <div class="row">
        <div class="col">
            Odo length: {{ odolength }}
        </div>
    </div>
    <div class="row">
        <div class="col">
            <div class="float-left">
                <b-button  variant="outline-primary" size="sm" v-on:click="prev()">&lt; prev</b-button>
            </div>
            <div class="float-right">
                <b-button  variant="outline-primary" size="sm" v-on:click="next()">next &gt;</b-button>
            </div>
        </div>
    </div>
    <div class="row">
        <b-alert
            :show="nodata"
            variant="warning"
            >No data</b-alert>
    </div>
</div>
</template>

<script>
import vdataService from '../services/vdata-api'
import moment from "moment";

export default {
    props: ['vehicle'],
    data() {
        return {
            data: [],
            minTime: "-",
            maxTime: "-",
            date: "",
            odolength: 0,
            nodata: false
        }
    },
    methods: {
        prev() {
            this.nodata = false;
            vdataService.getPrev(this.vehicle)
                .then(data => this.dataReceived(data))
                .catch(err => this.nodata = true);
        },
        next() {
            this.nodata = false;
            vdataService.getNext(this.vehicle)
                .then(data => this.dataReceived(data))
                .catch(err => this.nodata = true);;
        },
        dataReceived(res) {
            if (res.data.length == 0)
                return;
            this.date = moment(res.data[0].time).format("YYYY-MM-DD");
            this.minTime = moment(res.data[0].time).format("hh:mm:ss");
            this.maxTime = moment(res.data[res.data.length - 1].time).format("hh:mm:ss");
            this.odolength = Number(res.data[res.data.length - 1].odo - res.data[0].odo).toPrecision(2);
            this.$emit('data', res);
        }
    }
}
</script>
