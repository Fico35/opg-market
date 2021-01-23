const { Router } = require('express');
const crypto = require('crypto');

const authRouter = Router();

authRouter.post('/login', (req, res, next) => {
    if (req.body.username != null && req.body.password != null) {
        let username = req.body.username;
        let password = req.body.password;
        req.app.locals.db.query(`SELECT * FROM user WHERE user.username = "${username}";`, (err, results, fields) => {
            if (err) {
                console.error(err);
                res.status(500).end();
            } else {
                if (results.length > 0) {
                    let salt = results[0].pass_salt;
                    let storedHash = results[0].pass_hash;
                    let hashedPassword = crypto.pbkdf2Sync(password, salt, parseInt(process.env.HASH_ITERATIONS), 256, 'sha256').toString('hex');
                    if (storedHash === hashedPassword) {
                        let sid;
                        do {
                            sid = crypto.randomBytes(128).toString('hex');
                        } while (req.app.locals.sessionMap.has(sid));
                        let expiresTime = new Date();
                        expiresTime.setTime(expiresTime.getTime() + 24 * 60 * 60 * 1000);
                        req.app.locals.sessionMap.set(sid, {user_id:results[0].user_id, expires:expiresTime});
                        res.cookie('user_id', results[0].user_id, {signed:false, maxAge:expiresTime});
                        res.cookie('sid', sid, {signed:true, maxAge:expiresTime});
                        res.status(200).end();
                    } else {
                        // incorrect password
                        res.status(401).end("password");
                    }
                } else {
                    // username doesn't exist
                    res.status(401).end("username");
                }
            }
        });
    } else {
        res.status(400).end();
    }
});

authRouter.post('/register', (req, res, next) => {
    if (req.body.username != null && req.body.password != null && req.body.opg_name != null) {
        let username = req.body.username;
        let password = req.body.password;
        let opg_name = req.body.opg_name;
        let salt = crypto.randomBytes(256).toString('hex');
        let hashedPassword = crypto.pbkdf2Sync(password, salt, parseInt(process.env.HASH_ITERATIONS), 256, 'sha256').toString('hex');
        req.app.locals.db.query(`SELECT user.username FROM user WHERE user.username = "${username}";`, (err, results, fields) => {
            if (err) {
                console.error(err);
                res.status(500).end();
            } else {
                if (results.length === 0) {
                    req.app.locals.db.query(`INSERT INTO user (username, pass_hash, pass_salt, opg_name) VALUES ("${username}", "${hashedPassword}", "${salt}", "${opg_name}");`, (err2, results2, fields2) => {
                        if (err2) {
                            console.error(err2);
                            res.status(500).end();
                        } else {
                            req.app.locals.db.query(`SELECT * FROM user WHERE user.username = "${username}";`, (err3, results3, fields3) => {
                                if (err3) {
                                    console.error(err3);
                                    res.status(500).end();
                                } else {
                                    let sid;
                                    do {
                                        sid = crypto.randomBytes(128).toString('hex');
                                    } while (req.app.locals.sessionMap.has(sid));
                                    let expiresTime = new Date();
                                    expiresTime.setTime(expiresTime.getTime() + 24 * 60 * 60 * 1000);
                                    req.app.locals.sessionMap.set(sid, {user_id:results3[0].user_id, expires:expiresTime});
                                    res.cookie('user_id', results3[0].user_id, {signed:false, maxAge:expiresTime});
                                    res.cookie('sid', sid, {signed:true, maxAge:expiresTime});
                                    res.status(200).end();
                                }
                            });
                        }
                    });
                } else {
                    // existing username
                    res.status(403).end("username");
                }
            }
        });
    } else {
        res.status(400).end();
    }
});

authRouter.get('/logout', (req, res, next) => {
    if (req.signedCookies.sid != null) {
        req.app.locals.sessionMap.delete(req.signedCookies.sid);
    }
    res.cookie('user_id', "user_id", {signed:false, maxAge:new Date(0)});
    res.cookie('sid', "sid", {signed:true, maxAge:new Date(0)});
    res.redirect('/login');
});

module.exports = authRouter;
