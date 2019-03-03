module.exports = {
    env: 'prod',
    db_url: 'mongodb://localhost:27017',
    db_name: 'challenge-viriciti-test',
    db_replicatset: 'rs',
    nats_url: 'localhost',
    nats_subject: "vehicle-data",
    restapi_port: 8080,
    websocket_port: 80
};
