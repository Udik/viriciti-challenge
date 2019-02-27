const restify = require('restify');
const errs = require('restify-errors');
const DbSource = require('./dbsource.js');
const config = require('../config/config');

const server = restify.createServer({
    name: 'viriciti-rest-api',
    version: '1.0.0'
});

server.use(restify.plugins.acceptParser(server.acceptable));
server.use(restify.plugins.queryParser());

// defines routes in the format
// /vehicledata/<vehicle-name>
// with optional query params: minTime, maxTime, lastId, dir, limit
server.get({ name: 'vehicledata-specific', path: '/vehicledata/:vname'}, (req, res, next) => {
    serveVehicleData('vehicledata-specific', req.params.vname, req, res, next);
});

// defines routes in the format
// /vehicledata
// with optional query params: minTime, maxTime, lastId, dir, limit
server.get({name: 'vehicledata-all', path: '/vehicledata'}, (req, res, next) => {
    serveVehicleData('vehicledata-all', undefined, req, res, next);
});

async function start() {
    try {
        await DbSource.connect();
        server.listen(config.restapi_port, function () {
            console.log('rest server %s listening at %s', server.name, server.url);
        });
    }
    catch(err) {
        console.log("error starting the rest server", err);
    }
}


// returns query data in the format:
// {
//    data: VehicleData[],
//    pagination: {
//       prev: "<link to previous page, with same query params>",
//       next: "<link to previous page, with same query params>"
//    }
// }
function serveVehicleData(route, vname, req, res, next) {

    try {
        var searchParams = buildSearchParams(req.query);
        if (vname)
            searchParams.vname = vname;
    }
    catch(err) {
        res.send(new errs.BadRequestError(err.message));
        next();
        return;
    }

    DbSource.getVehicleData(searchParams)
        .then(data => {
            let pagination = {};

            if (data.length > 0) {
                pagination = {
                    prev: server.router.render(route, { vname }, {
                        ...req.query,
                        lastId: data[0]._id,
                        dir: 'prev'
                    }),
                    next: server.router.render(route, { vname }, {
                        ...req.query,
                        lastId: data[data.length-1]._id,
                        dir: 'next'
                    }),
                }
            }
            res.send({ data, pagination })
        })
        .catch(err => {
            console.error(err);
            res.send(new errs.InternalServerError(err.message));
        })
        .then(() => next());
}

function buildSearchParams(query) {
    var searchParams = {
        ...query.minTime !== undefined && { minTime: parseInt(query.minTime)},
        ...query.maxTime !== undefined && { maxTime: parseInt(query.maxTime)},
        ...query.lastId !== undefined && { lastId: query.lastId},
        ...query.dir !== undefined && { dir: query.dir},
        limit: 500
    };

    if (query.limit && query.limit < 500)
        searchParams.limit = parseInt(query.limit);

    validateParams(searchParams);

    return searchParams;
}

function validateParams(p) {
    if (p.minTime !== undefined && (p.minTime < 0 || isNaN(p.minTime)))
        throw new Error("Invalid min time limit");
    if (p.maxTime !== undefined && (p.maxTime < 0 || isNaN(p.maxTime)))
        throw new Error("Invalid max time limit");
    if (p.maxTime && p.minTime && p.minTime > p.maxTime)
        throw new Error("Invalid min-max time limit");
    if (p.dir !== undefined && p.dir !== "prev" && p.dir !== "next")
        throw new Error("Invalid direction");
}

start();

module.exports = server;
