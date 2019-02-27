process.env.NODE_ENV = 'test';

const expect = require('chai').expect;
const streamToArray = require('stream-to-array');

const config = require('../../src/config/config');
const natsReader = require('../../src/shared/reader-nats');
const data = require('../testdata');

describe('NATS reader tests', function () {

    it('reads a stream of objects from nats', async ()=> {
        let natsreader = new natsReader();
        let readstream = await natsreader.init();
        
        let resprom = new Promise(res=> streamToArray(readstream, (err, arr)=> {
            expect(arr.map(a=>a.msg)).to.deep.equal(data);
            res();
        }));

        for (const d of data) {
            await new Promise((res, rej) =>  natsreader.nats.publish(`${config.nats_subject}.${d.vname}`, d, ()=>res()));
        };
        await timeout(10);
        natsreader.stop();
        await resprom;
    });
});

function timeout(t, v) {
    return new Promise(resolve => {
        setTimeout(resolve.bind(null, v), t)
    });
}

