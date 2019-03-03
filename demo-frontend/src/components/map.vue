<template>
    <div style="width: 100%; height: 400px;">
        <l-map :zoom="zoom" :center="center">
            <l-tile-layer :url="url" :attribution="attribution"></l-tile-layer>
            <l-polyline :lat-lngs="[buspath]" color="#0ab"></l-polyline>
            <l-marker :lat-lng="marker"></l-marker>
        </l-map>
    </div>
</template>

<script>
import { LMap, LTileLayer, LMarker, LPolyline } from 'vue2-leaflet'
import pld from 'vue2-leaflet-polylinedecorator'

// src/components/App.js
export default {
    name: 'Map',
    components: {
        LMap, LTileLayer, LMarker, LPolyline,
        'v-polyline-decorator': pld
    },
    data() {
        return {
            zoom:13,
            center: L.latLng(0, 0),
            url:'http://{s}.tile.osm.org/{z}/{x}/{y}.png',
            attribution:'&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
            marker: L.latLng(0, 0),
            buspath: []
        }
    },
    methods: {
        clear() {
            this.buspath = [];
        },
        setPosition(lat, long) {
            this.marker = L.latLng(lat, long);
            this.center = L.latLng(lat, long);
            this.buspath.push(L.latLng(lat, long));
        },
        setHistory(points) {
            let llArr = points.map(p=>L.latLng(p.lat, p.long));
            this.buspath = llArr;
            let lastPoint = points[points.length - 1];
            this.center = L.latLng(lastPoint.lat, lastPoint.long);
            this.marker = L.latLng(lastPoint.lat, lastPoint.long);
        }
    },
    created() {
    }
};
</script>

