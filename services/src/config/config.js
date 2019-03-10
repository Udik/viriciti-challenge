const env = process.env.NODE_ENV || "dev";

let config = require(`./${env}`);

for (let p in config) {
    if (process.env[p.toUpperCase()])
        config[p] = process.env[p.toUpperCase()];
}

module.exports = config;
