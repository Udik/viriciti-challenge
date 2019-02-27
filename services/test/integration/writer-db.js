process.env.NODE_ENV = 'test';

const expect = require('chai').expect;
const MongoClient = require('mongodb').MongoClient;

const { pipeline } = require('readable-stream');
const streamify = require('stream-array');

const config = require('../../src/config/config');
const DbWriter = require('../../src/shared/writer-db');
const data = require('../testdata');

describe('DbWriter Tests', function () {

    let dbClient = null;

    before(async () => {
        let dbconn = await MongoClient.connect(`${config.db_url}`, {  useNewUrlParser: true })
        dbClient = dbconn.db(config.db_name);
    });

    beforeEach(async () => {
        await setupDatabase(dbClient);
    });

    it('writes a stream of objects to the db', async ()=> {
        let writestream = await new DbWriter().init();
        await new Promise((res, rej) => pipeline(streamify(data), writestream, res));
        let outData = await dbClient.collection("vehicledata").find().toArray();

        outData.forEach(od=> { delete od.__v; delete od._id; });
        expect(outData).to.deep.equal(data);
    });
});

async function setupDatabase(client) {
    let collections = await client.listCollections().toArray();

    if (collections.some(c => c.name == "vehicledata")) {
        await client.collection("vehicledata").drop();
        console.log("Collection deleted");
    } else {
        console.log("No collection to delete");
    }
}


