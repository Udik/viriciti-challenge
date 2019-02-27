const mongoose = require('mongoose');
const config = require('../config/config');
const Writable = require ("stream").Writable;

let VehicleData = require('./mongoose-schema');

class DbWriter {

    constructor() {
        this.persist = this.persist.bind(this);
    }

    async init() {
        try {
            this.writableStream = new Writable({objectMode: true});

            await mongoose.connect(`${config.db_url}/${config.db_name}`, { useNewUrlParser: true });

            this.writableStream._write = async (obj, encoding, next) => {
                await this.persist(obj);
                next();
            }
        }
        catch (err) {
            console.log(err);
            throw err;
        }

        return this.writableStream;
    }

    async persist(object) {
        try {
            await (new VehicleData(object)).save();
        }
        catch (err) {
            console.log("Error inserting obj for vehicle ", object);
            if (err instanceof mongoose.Error.ValidationError) {
                console.log("validation error for %s, skipping", object);
            }
            else {
                console.log(err);
            }
        }
    }
}


module.exports = DbWriter;
