// src/main.js
require('file-loader?name=[name].[ext]!./index.html');

import Vue from 'vue'
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-vue/dist/bootstrap-vue.css';
import 'leaflet/dist/leaflet.css';
import 'leaflet/dist/images/marker-shadow.png';
import 'leaflet/dist/images/marker-icon.png';
import BootstrapVue from 'bootstrap-vue';

Vue.use(BootstrapVue);

import App from './components/dashboard.vue';

import VueSocketIO from 'vue-socket.io';

Vue.use(new VueSocketIO({
  connection: 'http://localhost:8090/vehicledata'
}));

new Vue({
  render: h => h(App),
}).$mount(`#app`);
