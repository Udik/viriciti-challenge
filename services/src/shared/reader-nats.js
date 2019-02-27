const NATS = require("nats");
const config = require('../config/config');
const Readable = require ("stream").Readable;

class NatsReader {

    async init() {
        this.readableStream = new Readable({
            objectMode: true,
            read() {} 
        });

        await new Promise((resolve, reject) => {
            this.nats = NATS.connect(config.nats_url, {
                json: true
            });
    
            this.nats.on("connect", connection => {
                
                console.log(`connected, listening for subject: ${config.nats_subject}.*`);

                this.nats.subscribe(`${config.nats_subject}.*`, (msg, reply, subject) => {
                    this.readableStream.push({ msg, subject });
                });

                resolve();
            });

            this.nats.on("error", err => reject(err));
        });

        return this.readableStream;
    }

    stop() {
        this.readableStream.push(null);
    }
}

module.exports = NatsReader;
