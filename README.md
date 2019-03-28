# Nodejs challenge

Three services for a Nodejs challenge.

## Short challenge description

A NATS server (https://nats.io/) receives realtime location and metrics data from a number of vehicles and distributes it to its subscribers. The challenge is to build the following components:

- a data ingestion service saving the data to a MongoDB instance
- a websocket endpoint for web clients, streaming real time data
- a simple rest api to query historical data
- a small web application to consume and display the data

The challenge provides a script (vehicle-data-generator) to generate simulated data to be sent to NATS.

## Solution outline

* data-storage: data ingestion service
* websocket-api: websocket endpoint
* rest-api: small rest api developed based on restify, with query parameters and pagination 
* demo-frontend: a small vue application to show realtime or historical data, with a map for location data and dynamic graphs for metrics.

The basic components of the application expose redable, writable or transform stream, allowing some composition. For example, both the data ingestion and the websocket endpoint reuse the same NATS connector and data transformation stream, piping the results to a different writer. I.e.:

ingestion: NATS reader -> data transformation -> MongoDB writer

websocket: NATS reader -> data transformation -> websocket writer

A docker-compose configuration is included to run the whole system, including an nginx reverse proxy for the different web endpoints, a NATS server and a MongoDB server (but not the vehicle data generator, that has to be started independently).

## Data ingestion

The service is implemented using streams. A connector class with NATS exposes the incoming data as a readable object stream; a transform stream maps the incoming object to a structure that matches the database schema; a third class exposes a writable stream and writes the incoming data to a database collection. The streams are piped to each other.

## Websocket API

### NATS version

This version reuses the NATS readable stream and the transform stream as for the data ingestion; but the destination stream in this case is provided by a WebsocketWriter class that wraps a Socket.io server (it's not strictly a websocket but adds flexibility, and it's simpler).

Drawback: streamed data objects and rest api data objects are not identical. For example, ObjectId is missing in the streamed objects, as they never passed through the database.

### Mongo change stream version

A newer version of the websocket api endpoint instead uses the MongoDb changestream as a data source. A connector class exposes a readable stream fed by the MongoDB changestream, and the stream is piped directly to the WebsocketWriter class.

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


# Demo web app

I added a small demo app to test the websocket and rest api. The app shows a map, graphs for speed, energy and soc, and can switch between the live data provided by the websocket and the historical data provided by the rest api, as well as switch between different vehicles.

The app is configured to access the rest api and the websocket on the same base url as the main application (through a reverse proxy, as in the dockerized version- see below). To change the configuration to access api and socket on different ports, replace the file /app/src/config.js with /app/src/config-local.js

To install: from demo-frontend

~~~
npm install
npm run dev
~~~

The app is made in Vue and uses bootstrap, leaflet, Chart.js , Socket.io, Axios, moment.

Config-local accesses the rest api on localhost port 8080 and socket.io on localhost port 8090.
Screenshot below.

![alt text](/demo-app.jpg)


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


# Docker and docker-compose

I've set up a docker-compose architecture for running all the services and the demo web app.
Thee architecture is composed of:

- a reverse proxy (ngninx), to route calls to the demo app, the rest api and the websocket
- the storage (data ingestion) service
- a mongodb instance
- a nats server
- the rest api
- the websocket api
- the demo frontend app

To run the docker compose setup:

~~~
docker-compose up
~~~

The data generation script is not part of the setup.


## Tests

The application has integration and unit tests for its components, made using Mocha, Chai, Chai-Http, and Sinon. 

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
    db_replicaset: 'rs',
    nats_url: 'localhost',
    nats_subject: "nats-test.vehicle-data",
    restapi_port: 8080,
    websocket_port: 80
};
~~~~