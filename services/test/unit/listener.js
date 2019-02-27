process.env.NODE_ENV = 'test';

const chai = require("chai");

const expect = chai.expect;
const sinon = require('sinon');

const NATS = require("nats");
const NatsReader = require('../../src/shared/reader-nats');

const EventEmitter = require('events').EventEmitter;

describe('Listener Tests', function () {
    
    it("wires up NATS", async (done)=>{
        let nats = new EventEmitter();
        nats.subscribe = sinon.stub();

        NATS.connect = sinon.stub().returns(nats);

        let reader = new NatsReader();

        reader.init();
        nats.emit("connect", null);

        expect(NATS.connect.called).be.true;
        expect(nats.subscribe.called).be.true;
        expect(nats.subscribe.args[0][0].indexOf("vehicle-data.*")).to.be.greaterThan(-1);
        
        done();
    })

});
