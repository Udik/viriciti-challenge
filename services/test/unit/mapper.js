process.env.NODE_ENV = 'test';

const expect = require('chai').expect;
const mapper = require('../../src/shared/transform-mapper');
const streamToArray = require('stream-to-array');
const streamify = require('stream-array');
const { pipeline } = require('readable-stream');

describe('Mapper Tests', function () {

    it("maps correctly source data and subject to schema", done => {
        let transform = new mapper().init();

        streamToArray(pipeline(streamify(mapperTestData), transform), (err, arr) => {
            
            expect(arr).to.deep.equal([{
                vname: "subject",
                time: 1234,
                energy: 12.1234,
                odo: 23.345,
                speed: 34.567,
                soc: 45.678,
                position: {
                    type: "Point",
                    coordinates: [34.567, 12.345]
                }
            }, {
                vname: "subject2",
                time: 2345,
                energy: 23.1234,
                odo: 23.345,
                speed: 34.567,
                soc: 45.678,
                position: {
                    type: "Point",
                    coordinates: [34.567, 12.345]
                }
            }]);

            done();
        })
    });
});

const mapperTestData = [{
    subject: "my.test.subject", 
    msg: {
        time: 1234,
        energy: 12.1234,
        gps: "12.345|34.567",
        odo: 23.345,
        speed: 34.567,
        soc: 45.678
    }
}, {
    subject: "my.test.subject2", 
    msg: {
        time: 2345,
        energy: 23.1234,
        gps: "12.345|34.567",
        odo: 23.345,
        speed: 34.567,
        soc: 45.678
    }
}];

