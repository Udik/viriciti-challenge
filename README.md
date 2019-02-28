# ViriCiti Nodejs challenge

Three services for the Viriciti Nodejs challenge.

* data-storage: listens to messages from a NATS server, transforms them and stores the data in a MongoDb  instance;
* websocket-api: provides the same data for real time consumption by a web application.
* rest-api: provides a simple rest api to query the data in the MongoDb database.

## Data storage

The service is implemented using streams. A first class acts as a connector with NATS and exposes the incoming data as a readable object stream; a second class exposes a transform stream that maps the incoming object to a structure that matches the database schema; a third class exposes a writable stream and writes the incoming data to a database collection. The streams are piped to each other.

## Websocket API

The websocket api is also implemented with streams, piping the NATS origin through the transform stream as before; but the destination stream in this case is provided by a WebsocketWriter class that wraps a Socket.io server (it's not strictly a websocket but adds flexibility, and it's simpler).

A better option would have been using the MongoDb changestream as a source for the websocket connector- it would have guaranteed perfect identity between rest api and websocket data; but that seems to require configuring a replica set on the MongoDb server (working on it).

## Rest API

It provides two endpoints:
- /vehicledata
- /vechicledata/{vehicle-name}

both endpoints accept the same set of query parameters that can be combined freely:
- minTime: the min (Unix) timestamp for the returned data
- maxTime: the max (Unix) timestamp
- limit: the page size (1-500)
- lastId + dir=[prev|next]: the Mongo ObjectId of the first/last element of the previous page, and the query direction for the next.

The format returned by the api is the following:
	
~~~~
{
    data: array of data points from the DB,
    pagination: {
      prev: "<link to previous page, with same query params>",
      next: "<link to following page, with same query params>"
    }
}
~~~~

I've used Restify for the server, which also provides the automatic generation of paging links.
Mongoose is used to access the Db.

## Testing

The application has (improvable) integration and unit tests for its components, made using Mocha, Chai, Chai-Http, and Sinon. 

# To install, test and run

From the /services folder:

`npm install`

To run the tests:

`npm run test:unit`

and

`npm run test:int`

or, all together:

`npm test`

**Integration tests will run against active NATS and MongoDb server** 

The configuration (DB connection string, endpoints, etc.) are set in /services/src/config/test.js as  following:

~~~~
{
    env: 'test',
    db_url: 'mongodb://localhost:27017',
    db_name: 'challenge-viriciti-test',
    nats_url: 'localhost',
    nats_subject: "nats-test.vehicle-data",
    restapi_port: 8080,
    websocket_port: 80
};
~~~~

## run the services

`npm run start:all`

Starts all the services in a console window, using by default the configuration in /services/src/config/dev.js.

Or they can be started one by one as 

~~~
npm run start:storage
npm run start:websocket
npm run start:rest
~~~

The vechicle-data-generator has to be started separately. 

**NOTE:** It's better to use the data generator provided in the repository as I've changed the message subject to `nats-dev.vehicle-data.`

The data generator needs to be installed separately: from ./vehicle-data-generator:

~~~
npm install
node ./index.js
~~~

# Issues

Many, but the first that come to mind. I wanted to create entirely separate services, but also wanted to share code between them. For example the NATS connector and transform stream are used both by the data storage and the websocket services, and the Mongoose model is shared between storage and rest api. I ended up with a single node package with multiple independent applications inside, but it's far from ideal.

Some rows in the test csv lack a data point and the Mongoose validation fails and the object is not saved- you'll see errors in the console. The mongoose schema definition can be relaxed but the validation on the object also seems a good feature.

# Questions in the Vehicledata generator

First: 

* fs.createReadStream- opens a file stream for read; it's more complicated but useful for "passthrough" processing of very large files. Only sequential access to the file contents.
* fs.readFileAsync- reads a file asynchronously, providing the entire content to a callback function. Doesn't block the event loop, allows random access to the files content. Drawback: loads the entire file content in memory. 
* fs.readFileSync- reads an entire file synchronously (blocking the node thread and the event loop). Option for scripts that don't have concurrent users or event processing (e.g. batch scripts). As readFileAsync, loads the entire content of the file in memory.

Second:

If publishing of events to NATS is slow the callback of `nats.publish` will be called later, creating (I believe) a backpressure in the input stream- i.e., the csv file will be read slower. To simulate a slower connection, I've replaced the line

```javascript
nats.publish(`nats-dev.vehicle-data.${vehicleName}`, obj, cb)
```

with

```javascript
nats.publish(`nats-dev.vehicle-data.${vehicleName}`, obj, ()=>{
  setTimeout(cb, Math.ceil(Math.random() * slowConnection.range) + slowConnection.minDelay);
});
```

## Reverse driving

I've implemented Hank's reverse driving using fs-reverse, a small library that provides a reverse (line by line) stream of an input file. However, since the csv headers are at the top of the file, I had to remove them from the csv input file and concatenate them to the forward and reverse streams with the combine-streams package. It works, but the further issue is that the timestamps now are reversed on the reverse journey. It could be fixed by a transform stream that changed them on the fly. 

# Web interface, Docker, etc.

Working on it... :)
