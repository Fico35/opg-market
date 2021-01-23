const fs = require('fs');
const path = require('path');

const logStream = fs.createWriteStream(path.join(__dirname, 'server.log'), {flags:'a', encoding:process.env.FS_ENCODING});

const loggerMiddleware = (req, res, next) => {
    logStream.write(`${new Date().toISOString()} ${req.method} ${req.url}\n`, process.env.FS_ENCODING);
    next();
};

module.exports = loggerMiddleware;
