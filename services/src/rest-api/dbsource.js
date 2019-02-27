const mongoose = require('mongoose');
const config = require('../config/config');

// mongoose.set('debug', true);

let VehicleData = require('../shared/mongoose-schema');

// Connection URL
const url = `${config.db_url}/${config.db_name}`;

// connect to MongoDB
async function connect() {
    try {
        await mongoose.connect(url, { useNewUrlParser: true })
        console.log("MongoDB client connected");
    }
    catch(err) {
        console.error("Error connecting to the server", err);
        throw err;
    }
}

/* expects a params object in the format:
    {
        vname?: string,
        minTime?: number,
        maxtTime?: number,
        lastId?: string,
        direction?: 'prev'|'next'
        limit: number
    }
*/
async function getVehicleData(params) {
    let q = VehicleData.find();
    if (params.vname) q.where('vname').equals(params.vname);
    if (params.minTime) q.where('time').gte(params.minTime);
    if (params.maxtTime) q.where('time').lte(params.maxtTime);
    if (params.lastId) {
        q.where('_id');
        if (params.dir == 'next') q.gt(params.lastId);
        else if (params.dir == 'prev') q.lt(params.lastId);
    }
    q.limit(params.limit);
    return await q.exec();
}

module.exports = {
    connect,
    getVehicleData
};
