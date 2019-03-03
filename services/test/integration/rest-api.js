process.env.NODE_ENV = 'test';

const mongoose = require("mongoose");

const chai = require('chai');
const chaiHttp = require('chai-http');

chai.should();

const config = require('../../src/config/config');
const server = require('../../src/rest-api/index');
const VehicleData = require('../../src/shared/mongoose-schema');
const dbData = require('../dbtestdata');

chai.use(chaiHttp);

describe("Rest API tests", () => {

    before(async () => {
        // reset the test db
        await resetTestDb();
    });

    describe("get /vehicledata", () => {

        it("returns the results with data and pagination", async () => {
            let res = await chai.request(server).get('/vehicledata')
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.data.should.be.a('array');
            res.body.pagination.should.be.a('object');
            res.body.pagination.prev.should.be.a('string');
            res.body.pagination.next.should.be.a('string');
        });

        it("limits to 500 results", async () => {
            let res = await chai.request(server).get('/vehicledata')
            res.body.data.length.should.be.eql(500);
        });

        it("allows to set a lower results limit", async () => {
            let res = await chai.request(server).get('/vehicledata?limit=10')
            res.body.data.length.should.be.eql(10);
        });

        it("ignores limits higher than 500", async () => {
            let res = await chai.request(server).get('/vehicledata?limit=501')
            res.body.data.length.should.be.eql(500);
        });
    });

    describe("get /vehicledata/<vname>", () => {
        it("returns the correct results", async () => {
            let res = await chai.request(server).get('/vehicledata/test-bus-2');
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.data.should.be.a('array');
            res.body.data.length.should.be.eql(10);
            res.body.data[0].vname.should.be.eql("test-bus-2");
        });
    });

    describe("pagination", () => {
        it("pagination.next and prev links work", async () => {
            let res1 = await chai.request(server).get('/vehicledata?limit=2');
            let res2 = await chai.request(server).get(res1.body.pagination.next);
            let res3 = await chai.request(server).get(res2.body.pagination.next);
            let res4 = await chai.request(server).get(res3.body.pagination.prev);
            res3.body.data.length.should.be.eql(2);
            res4.body.data.length.should.be.eql(2);
            res3.body.data[0].time.should.be.eql(1511436342000);
            res3.body.data[1].time.should.be.eql(1511436343000);
            res4.body.data[0].time.should.be.eql(1511436340000);
            res4.body.data[1].time.should.be.eql(1511436341000);
        });

        it("pagination res and prev have same parameters as original query", async () => {
            let res1 = await chai.request(server).get('/vehicledata?limit=2&minTime=0&maxTime=2511436983000');
            res1.body.pagination.prev.should.have.string("limit=2");
            res1.body.pagination.next.should.have.string("limit=2");
            res1.body.pagination.prev.should.have.string("minTime=0");
            res1.body.pagination.next.should.have.string("maxTime=2511436983000");
        });
    });

});

async function resetTestDb() {
    await mongoose.connect(`${config.db_url}/${config.db_name}`, { useNewUrlParser: true });
    await VehicleData.deleteMany({});
    for (let obj of dbData) {
        await new VehicleData(obj).save();
    }
}
