# ViriCiti Nodejs Assignment

Three services for the Viriciti Nodejs assignment.

* data-storage: listens to messages from a NATS server, transforms them and stores data in a MongoDb  instance;
* websocket-api: provides the same data in real time through a websocket (in fact Socket.io)
* rest-api: provides a simple rest api to query the MongoDb database

## Data storage

Uses a NatsReader class that connects to the NATS server and exposes a stream of objects; the stream is piped through a transformation stream (transform-mapper) and finally piped to a the writable stream provided by a class that wraps the database operations (writer-db).

## Websocket API

The websocket api also uses the NatsReader class to listen to the same NATS events (a change stream from MongoDb was also an option, but more complicated) and pipes the stream through the same mapper as before; but the destination stream is provided by a WebsocketWriter class that wraps the live data stream. For the socket I've used Socket.io, which adds flexibility (though it's not strictly a websocket).

## Rest API

It provides two endpoints:
- /vehicledata
- /vechicledata/{vehicle-name}

both endpoints also accept the same set of query parameters that can be combined freely:
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

## Libraries used:

Mongoose is used to access the database, sharing the same VehicleData model between the db writer stream and the rest api.

Restify is used for the rest api server.

Socket.io provides the stream of live data to web applications.

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

**Integration tests will run against a live NATS and MongoDb server** The configuration (DB connection string, endpoints, etc.) are set in /services/src/config/test.js as the following:

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
npm start:storage
npm start:websocket
npm start:rest
~~~

The vechicle-data-generator has to be started separately.

# Web interface, Docker, etc.

Working on it... :)
