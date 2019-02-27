process.env.NODE_ENV = 'test';

const expect = require('chai').expect;
const { pipeline } = require('readable-stream');
const streamify = require('stream-array');

const config = require('../../src/config/config');
const WsWriter = require('../../src/shared/writer-websocket');
const WsClient = require('socket.io-client');
const data = require('../testdata');

describe('Websocket writer Tests', function () {

    it('writes a stream of objects to the socket', async ()=> {
        var socket = WsClient(`http://localhost:${config.websocket_port}/vehicledata`);
        
        let outData = [];
        socket.on('vdata', function(data){
            outData.push(data);
        });
        
        let writestream = await new WsWriter().init();

        await new Promise(res => socket.on('connect', ()=>res()));
        await new Promise(res => pipeline(streamify(data), writestream, res));

        await timeout(1000);

        outData.forEach(od=> { delete od.__v; delete od._id; });
        expect(outData).to.deep.equal(data);
    });
});


function timeout(t, v) {
    return new Promise(resolve => {
        setTimeout(resolve.bind(null, v), t)
    });
}

