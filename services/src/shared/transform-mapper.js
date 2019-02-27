const Transform = require('stream').Transform;

class MsgTransform {

    init() {
        this.transformStream = new Transform({
            readableObjectMode: true,
            writableObjectMode: true,
            transform: map
        });

        return this.transformStream;
    }
}

function map(obj, encoding, callback) {
    let vname = obj.subject.split('.').pop();
    let coords = obj.msg.gps.split('|');
    let out = {
        vname,
        time: obj.msg.time,
        energy: obj.msg.energy,
        odo: obj.msg.odo,
        speed: obj.msg.speed,
        soc: obj.msg.soc,
        position: { type: "Point", coordinates: [parseFloat(coords[1]), parseFloat(coords[0])] }
    };

    this.push(out);
    callback();
}

module.exports = MsgTransform;
