
/*

In this file you will find how we send raw data to other services via nats
There are 2 question points for you to tell us the answer on your presentation
If you're up for it

*/
const csvParse      = require ( "csv-parse")
const fs            = require ( "fs")
const Writable      = require ("stream").Writable
const Readable      = require ("stream").Readable

const fsReverse		= require("fs-reverse");
const CombinedStream = require('combined-stream');

const slowConnection = {
	minDelay: 0,
	range: 0
}

// NATS Server is a simple, high performance open source messaging system
// for cloud native applications, IoT messaging, and microservices architectures.
// https://nats.io/
// It acts as our pub-sub (https://en.wikipedia.org/wiki/Publish%E2%80%93subscribe_pattern)
// mechanism for other service that needs raw data
const NATS = require("nats")

// At this point, do not forget to run NATS server!

// NATS connection happens here
// After a connection is made you can start broadcasting messages (take a look at nats.publish())
const nats = NATS.connect({
	json: true
});

let i = 0

const outStream = (vehicleName) => new Writable({
	objectMode: true,
	write(obj, enc, cb) {
		// setTimeout in this case is there to emulate real life situation
		// data that came out of the vehicle came in with irregular interval
		// Hence the Math.random() on the second parameter
		setTimeout(() => {

			i++
			if((i % 100) === 0) {
				console.log(`vehicle ${vehicleName} sent have sent ${i} messages`)
				console.log(obj);
			}

			// The first parameter on this function is topics in which data will be broadcasted
			// it also includes the vehicle name to segregate data between different vehicle
			nats.publish(`nats-dev.vehicle-data.${vehicleName}`, obj, () => {
				// I've replaced the original callback with a lambda that fires the callback
				// after a random delay- this should simulate what happens on a slow connection
				setTimeout(cb, Math.ceil(Math.random() * slowConnection.range) + slowConnection.minDelay);
			});

		}, Math.ceil(Math.random() * 150))
	}
});

// This function will start reading out csv data from file and publish it on nats
const readOutLoud = (vehicleName, fileStream) => {
	// Read out meta/route.csv and turn it into readable stream
	return (fileStream
		// Filestream piped to csvParse which accept nodejs readablestreams and parses each line to a JSON object
		.pipe(csvParse({ delimiter: ",", columns: true, cast: true }))
		// Then it is piped to a writable streams that will push it into nats
		.pipe(outStream(vehicleName)))
	// =========================
	// Question Point 2:
	// What would happend if it failed to publish to nats or connection to nats is slow?
	// Maybe you can try to emulate those slow connection
	// =========================
}

const headersStream = () => { 
	let s = new Readable();
	s.push('time,energy,gps,odo,speed,soc\n');
	s.push(null);
	return s;
};

let fsForward = fs.createReadStream("./meta/route-short.csv");
let fsBackward = fsReverse("./meta/route-short.csv", { matcher: /(\r?\n)/ });

var combinedFw = CombinedStream.create();
combinedFw.append(headersStream());
combinedFw.append(fsForward);

var combinedBw = CombinedStream.create();
combinedBw.append(headersStream());
combinedBw.append(fsBackward);

// This next few lines simulate Henk's (our favorite driver) shift
console.log("Henk checks in on test-bus-1 starting his shift...")
readOutLoud("test-bus-1", combinedFw)
	.once("finish", () => {
		console.log("henk is on the last stop and he is taking a cigarrete while waiting for his next trip");

		readOutLoud("test-bus-1", combinedBw)
		.once("finish", ()=> {
			console.log("henk is back at the first stop and he is taking a cigarrete while waiting for his next trip")
		})
	})
	
// To make your presentation interesting maybe you can make henk drive again in reverse

// done!