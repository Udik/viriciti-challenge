<template>
<div>
    <b-navbar type="dark" variant="info">
        <b-navbar-brand>ViriCiti demo</b-navbar-brand>
    </b-navbar>
    <div class="mx-auto p-4">

        <div class="container">
            <div class="row">
                <div class="col">
                    <VechicleChoice :vehicles="vehicles" v-on:selection="vehicleSelection"></VechicleChoice>
                </div>
            </div>
        </div>
        <div class="container">
            <div class="row">
                <div class="col-9">
                    <div class="row">
                        <div class="col-12">
                            <Map ref="map"></Map>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-12">
                            Odometer: <strong>{{ distance }}</strong>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-4">
                            <div class="graphbox">
                                <LineGraph ref="speedgraph" label="speed" :height="200"></LineGraph>
                            </div>
                        </div>

                        <div class="col-4">
                            <div class="graphbox">
                                <LineGraph ref="energygraph" label="energy" :height="200"></LineGraph>
                            </div>
                        </div>

                        <div class="col-4">
                            <div class="graphbox">
                                <LineGraph ref="socgraph" label="soc" :height="200"></LineGraph>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="col-3">
                    <div>
                        <b-tabs content-class="mt-3" v-model="tabIndex">
                            <b-tab title="live" active>
                                Last received timepoint: <br> {{currentDateTime}}
                            </b-tab>
                            <b-tab title="historical">
                                <HistoryNavigator :vehicle="currentVehicle" v-on:data="setHistoryData"></HistoryNavigator>
                            </b-tab>
                        </b-tabs>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
</template>

<script>
import Map from "./map.vue";
import LineGraph from "./linegraph.vue";
import HistoryNavigator from "./history-navigator.vue";
import VechicleChoice from "./vehicle-choice.vue";
import moment from "moment";

// src/components/App.js
export default {
    name: "App",
    components: {
        Map,
        LineGraph,
        HistoryNavigator,
        VechicleChoice
    },
    sockets: {
        connect: function () {
            console.log("socket connected");
        },
        vdata: function (vdata) {
            if (this.tabIndex !== 0)
                return;

            // ignore datapoints that are not related to the current vehicle
            if (vdata.vname != this.currentVehicle)
                return;

            this.$refs.map.setPosition(
                vdata.position.coordinates[1],
                vdata.position.coordinates[0]
            );
            this.$refs.speedgraph.addValue(vdata.speed);
            this.$refs.energygraph.addValue(vdata.energy);
            this.$refs.socgraph.addValue(vdata.soc);
            this.currentDateTime = moment(new Date(vdata.time)).format(
                "DD/MM/YYYY hh:mm:ss"
            );
            this.distance = vdata.odo;
        }
    },
    data() {
        return {
            currentRoute: window.location.hash.replace("#", ""),
            currentDateTime: "-",
            distance: 0,
            tabIndex: 0,
            vehicles: [{
                name: "Test bus 1",
                code: "test-bus-1"
            }, {
                name: "Test bus 2",
                code: "test-bus-2"
            }],
            currentVehicle: ""
        };
    },
    methods: {
        input(num) {
            this.clearAll();
        },
        clearAll() {
            this.$refs.map.clear();
            this.$refs.speedgraph.clear();
            this.$refs.energygraph.clear();
            this.$refs.socgraph.clear();
        },
        setHistoryData(res) {
            this.$refs.map.setHistory(res.data.map(vd => ({
                lat: vd.position.coordinates[1],
                long: vd.position.coordinates[0]
            })))
            this.$refs.speedgraph.setValues(res.data.map(vd => vd.speed), res.dir);
            this.$refs.energygraph.setValues(res.data.map(vd => vd.energy), res.dir);
            this.$refs.socgraph.setValues(res.data.map(vd => vd.soc), res.dir);
            this.distance = res.data[res.data.length - 1].odo;
        },
        vehicleSelection(vehicle) {
            this.currentVehicle = vehicle;
            this.clearAll();
        }
    },
    created() {
        window.addEventListener("hashchange", this.hashchange);

    }
};
</script>

<style>
.graphbox {
    width: 100%;
    position: relative;
}
</style>
