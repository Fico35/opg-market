const { Router } = require('express');
const fs = require('fs');
const path = require('path');

const staticRouter = Router();

staticRouter.get('/', (req, res, next) => {
    res.redirect('/index');
});

staticRouter.get('/:fileName', (req, res, next) => {
    if (req.params.fileName === 'login') {
        res.sendFile(path.join(__dirname, '..', 'www', 'login.html'));
    } else if (req.params.fileName === 'register') {
        res.sendFile(path.join(__dirname, '..', 'www', 'register.html'));
    } else {
        if (req.signedCookies.sid != null) {
            if (req.app.locals.sessionMap.has(req.signedCookies.sid)) {
                let currentTime = new Date().getTime();
                if (currentTime < req.app.locals.sessionMap.get(req.signedCookies.sid).expires.getTime()) {
                    let filePath = path.join(__dirname, '..', 'www', req.params.fileName + '.html');
                    let fileContent = null;
                
                    // read file or default to 404.html
                    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
                        fileContent = fs.readFileSync(filePath, {encoding:process.env.FS_ENCODING});
                    } else {
                        fileContent = fs.readFileSync(path.join(__dirname, '..', 'www', '404.html'), {encoding:process.env.FS_ENCODING});
                        res.status(404);
                    }
                
                    // replace partials with code
                    for (let htmlPartial of req.app.locals.htmlPartials.keys()) {
                        fileContent = fileContent.replace(RegExp('<' + htmlPartial + ' />', 'gi'), req.app.locals.htmlPartials.get(htmlPartial));
                    }
                
                    res.setHeader('Content-Type', 'text/html');
                    res.send(fileContent);
                    res.end();
                } else {
                    // session has expired
                    req.app.locals.sessionMap.delete(req.signedCookies.sid);
                    res.redirect('/login');
                }
            } else {
                // sid is not in session map
                res.redirect('/login');
            }
        } else {
            // no sid in cookies
            res.redirect('/login');
        }
    }
});

staticRouter.get('/controller/:fileName', (req, res, next) => {
    let filePath = path.join(__dirname, '..', 'www', 'controller', req.params.fileName);
    let fileContent = null;

    // read file or send 404
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
        fileContent = fs.readFileSync(filePath, {encoding:process.env.FS_ENCODING});
    } else {
        res.status(404);
    }

    // replace ENV.*variable* with string
    if (fileContent != null) {
        let envsMatched = fileContent.match(RegExp(/ENV\.[A-Z_]+/g));
        if (envsMatched != null) {
            for (let envMatched of envsMatched) {
                fileContent = fileContent.replace(RegExp(envMatched, "g"), '"' + process.env[envMatched.replace("ENV.", "")] + '"');
            }
        }
    }

    res.setHeader('Content-Type', 'text/js');
    res.send(fileContent);
    res.end();
});

module.exports = staticRouter;
