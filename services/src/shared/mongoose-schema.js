const mongoose = require('mongoose');

mongoose.pluralize(null);

let schema = mongoose.Schema({
    vname: { type: String, required: true },
    time: { type: Number, required: true },
    energy: { type: Number, required: true },
    odo: { type: Number, required: true },
    speed: { type: Number, required: true },
    soc: { type: Number, required: true },
    position: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    }
});

let VehicleData = mongoose.model("vehicledata", schema);

module.exports = VehicleData;
