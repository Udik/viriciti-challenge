const config = require('../config/config');
const Readable = require("stream").Readable;
const mongoose = require('mongoose');

class ChangestreamReader {

    async init() {
        this.readableStream = new Readable({
            objectMode: true,
            read() {} 
        });

        await mongoose.connect(`${config.db_url}/${config.db_name}?replicaSet=${config.db_replicatset}`, { useNewUrlParser: true });

        const pipeline = [
            { $match: { operationType: 'insert' } }
        ];

        const db = mongoose.connection;

        const collection = db.collection('vehicledata');
        const changeStream = collection.watch(pipeline);

        changeStream.on('change', change => {
            this.readableStream.push(change.fullDocument);
        });

        return this.readableStream;
    }

    stop() {
        this.readableStream.push(null);
    }
}

module.exports = ChangestreamReader;
