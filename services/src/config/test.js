module.exports = {
    env: 'test',
    db_url: 'mongodb://localhost:27017',
    db_name: 'challenge-viriciti-test',
    db_replicatset: 'rs',
    nats_url: 'localhost',
    nats_subject: "nats-test.vehicle-data",
    restapi_port: 8080,
    websocket_port: 8083
};
