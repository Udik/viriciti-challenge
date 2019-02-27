const NatsReader = require('../shared/reader-nats');
const DbWriter = require('../shared/writer-db');
const mapper = require('../shared/transform-mapper');

Promise.all([new NatsReader().init(),
            new mapper().init(), 
            new DbWriter().init()])

.then(([inStream, transform, outStream]) => {
    inStream.pipe(transform).pipe(outStream);
})
.catch(err => {
    console.log(err);
})
