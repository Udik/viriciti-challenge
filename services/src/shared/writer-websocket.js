const io = require('socket.io');
const config = require('../config/config');
const Writable = require ("stream").Writable;

class WebsocketWriter {

    constructor() {
    }

    async init() {
        this.totalClients = 0;

        this.writableStream = new Writable({objectMode: true});

        await new Promise((resolve, reject) => {
            try {
                this.io = io(config.websocket_port);
                this.io.origins('*:*');
                this.nsVehicleData = this.io.of('/vehicledata');
    
                this.nsVehicleData.on('connection', socket => {
                    this.totalClients++;
                    console.log("Connected clients:", this.totalClients);
    
                    socket.on('disconnect', () => {
                        this.totalClients--;
                        console.log("Connected clients:", this.totalClients);
                    });
                });

                this.writableStream._write = async (obj, encoding, next) => {
                    this.nsVehicleData.emit('vdata', obj);
                    next();
                }

                console.log("websocket available on port", config.websocket_port);
                resolve();
            }
            catch (err) {
                console.log(err);
                reject(err);
            }
        });

        return this.writableStream;
    }
}

module.exports = WebsocketWriter;
