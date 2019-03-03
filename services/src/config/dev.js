module.exports = {
    env: 'dev',
    db_url: 'mongodb://localhost:27017',
    db_name: 'challenge-viriciti-dev',
    db_replicatset: 'rs',
    nats_url: 'localhost',
    nats_subject: "nats-dev.vehicle-data",
    restapi_port: 8080,
    websocket_port: 8090
};
