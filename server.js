const fs = require('fs');
const path = require('path');
const express = require('express');
const cookieParser = require('cookie-parser');
const mysql = require('mysql');
const routers = require('./routers.js');
require('dotenv').config();
require('body-parser-xml')(express);

const app = express();

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

db.connect((err) => {
    if (err) {
        console.error(err);
        return;
    } else {
        app.locals.db = db;
    }
});

// load html partials before starting server
let partialsPath = path.join(__dirname, 'partials');
app.locals.htmlPartials = new Map();
if (fs.existsSync(partialsPath) && fs.statSync(partialsPath).isDirectory()) {
    let partialFiles = fs.readdirSync(partialsPath, {encoding:process.env.FS_ENCODING});
    for (let partialFile of partialFiles) {
        let partialFilePath = path.join(__dirname, 'partials', partialFile);
        if (fs.existsSync(partialFilePath) && fs.statSync(partialFilePath).isFile() && partialFile.toLowerCase().endsWith('.html')) {
            app.locals.htmlPartials.set(partialFile.toLowerCase().replace(/\.html$/i, ''), fs.readFileSync(partialFilePath, {encoding:process.env.FS_ENCODING}));
        }
    }
}

// create empty session map
app.locals.sessionMap = new Map();

// middleware (parsers and logger)
app.use(express.json());
app.use(express.xml());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(require('./logger.js'));

// routers
app.use(routers.staticRouter);
app.use('/auth', routers.authRouter);
app.use('/resource', routers.resourceRouter);
app.use('/api', routers.apiRouter);
app.use(express.static('www'));

// start server
app.listen(process.env.WEB_PORT, process.env.WEB_HOSTNAME, () => {
    console.log(`Server running on http://${process.env.WEB_HOSTNAME}:${process.env.WEB_PORT}/`);
});
