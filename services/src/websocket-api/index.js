const NatsReader = require('../shared/reader-nats');
const SocketWriter = require('../shared/writer-websocket');
const mapper = require('../shared/transform-mapper');

const config = require('../config/config');

Promise.all([new NatsReader().init(), 
            new mapper().init(), 
            new SocketWriter().init()])

.then(([inStream, transform, outStream])=> {
    console.log("websocket api started on port ", config.websocket_port);
    inStream.pipe(transform).pipe(outStream);
})

.catch(err => {
    console.log(err);
})
