import Axios from 'axios'

class VdataService  {

    constructor() {
        this.baseUrl = "http://localhost:8080";
        this.currentVehicle = "";
    }

    queryData(url, params) {
        return Axios.get(this.baseUrl + url, { params }).then(res=> {
            if (res.data.data.length == 0) {
                throw "no-data";
            }
            this.prev = res.data.pagination.prev;
            this.next = res.data.pagination.next;
            return res.data.data;
        });
    }

    getData(params, vehicle) {
        this.prev = null;
        this.next = null;
        this.currentVehicle = vehicle;
        return this.queryData(`/vehicledata/${vehicle}`, params)
        .then(data => ({
            data
        }));
    }

    getNext(vehicle) {
        if (vehicle !== this.currentVehicle)
            return this.getData({ limit: 50}, vehicle);

        if (!this.next)
            return Promise.reject("no-data");

        return this.queryData(this.next, {})
        .then(data => ({
            data,
            dir: "fwd"
        }));
    }

    getPrev(vehicle) {
        if (vehicle !== this.currentVehicle)
            return this.getData({ limit: 50}, vehicle);

        if (!this.prev)
            return Promise.reject("no-data");

        return this.queryData(this.prev, {})
        .then(data => ({
            data,
            dir: "bck"
        }));
    }
}

export default new VdataService()