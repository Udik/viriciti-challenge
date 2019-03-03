const ChangestreamReader = require('../shared/reader-changestream')
const SocketWriter = require('../shared/writer-websocket');

const config = require('../config/config');

Promise.all([new ChangestreamReader().init(), 
            new SocketWriter().init()])

.then(([inStream, outStream])=> {
    console.log("ws-changestream api started on port ", config.websocket_port);
    inStream.pipe(outStream);
})

.catch(err => {
    console.log(err);
})
