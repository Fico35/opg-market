const { Router } = require('express');
const crypto = require('crypto');

const apiRouter = Router();

function getUserId(req, res) {
    if (req.body.sid != null) {
        if (req.app.locals.sessionMap.has(req.body.sid)) {
            let currentTime = new Date().getTime();
            if (currentTime < req.app.locals.sessionMap.get(req.body.sid).expires.getTime()) {
                return req.app.locals.sessionMap.get(req.body.sid).user_id;
            } else {
                // session has expired
                req.app.locals.sessionMap.delete(req.body.sid);
                res.status(401).end("Session has expired");
                return false;
            }
        } else {
            res.status(401).end("Session ID is not valid");
            return false;
        }
    } else {
        res.status(400).end("Missing session ID ('sid' field in request body)");
        return false;
    }
}

/* -------------------------------------------------- */
/* ---------------------- AUTH ---------------------- */
/* -------------------------------------------------- */
apiRouter.post('/login', (req, res, next) => {
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
                        res.setHeader("Content-Type", "application/json");
                        res.status(200).end(JSON.stringify({sid:sid, expires:expiresTime.toISOString(), user_id:results[0].user_id}));
                    } else {
                        // incorrect password
                        res.status(401).end("Incorrect password!");
                    }
                } else {
                    // username doesn't exist
                    res.status(401).end("Username doesn't exist");
                }
            }
        });
    } else {
        res.status(400).end((req.body.username != null ? "" : "Missing input for 'username'.\n") + (req.body.password != null ? "" : "Missing input for 'password'.\n"));
    }
});

apiRouter.post('/register', (req, res, next) => {
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
                                    res.setHeader("Content-Type", "application/json");
                                    res.status(200).end(JSON.stringify({sid:sid, expires:expiresTime.toISOString(), user_id:results[0].user_id}));
                                }
                            });
                        }
                    });
                } else {
                    // existing username
                    res.status(403).end("Username already exists!");
                }
            }
        });
    } else {
        res.status(400).end((req.body.username != null ? "" : "Missing input for 'username'.\n")
                            + (req.body.password != null ? "" : "Missing input for 'password'.\n")
                            + (req.body.opg_name != null ? "" : "Missing input for 'opg_name'.\n"));
    }
});

apiRouter.post('/logout', (req, res, next) => {
    if (req.body.sid != null) {
        req.app.locals.sessionMap.delete(req.body.sid);
        res.status(200).end("Logged out");
    } else {
        res.status(400).end("Missing session ID ('sid' field in request body)");
    }
});


/* -------------------------------------------------- */
/* ---------------------- USERS --------------------- */
/* -------------------------------------------------- */
apiRouter.get('/users', (req, res, next) => {
    // get list of all users
    if (getUserId(req, res)) {
        req.app.locals.db.query(`SELECT user_id, username, opg_name FROM user;`, (err, results, fields) => {
            if (err) {
                console.error(err);
                res.status(500).end();
            } else {
                res.setHeader("Content-Type", "application/json");
                res.status(200).end(JSON.stringify(results));
            }
        });
    }
});

apiRouter.get('/user/:id/vegetables', (req, res, next) => {
    // get vegetables of specific user
    if (getUserId(req, res)) {
        req.app.locals.db.query(`SELECT * FROM vegetable WHERE vegetable.user_id = ${req.params.id};`, (err, results, fields) => {
            if (err) {
                console.error(err);
                res.status(500).end();
            } else {
                res.setHeader("Content-Type", "application/json");
                res.status(200).end(JSON.stringify(results));
            }
        });
    }
});

apiRouter.get('/user/:id/services', (req, res, next) => {
    // get services of specific user
    if (getUserId(req, res)) {
        req.app.locals.db.query(`SELECT * FROM service WHERE service.user_id = ${req.params.id};`, (err, results, fields) => {
            if (err) {
                console.error(err);
                res.status(500).end();
            } else {
                res.setHeader("Content-Type", "application/json");
                res.status(200).end(JSON.stringify(results));
            }
        });
    }
});

/* -------------------------------------------------- */
/* ------------------- VEGETABLES ------------------- */
/* -------------------------------------------------- */
apiRouter.get('/vegetables', (req, res, next) => {
    // get list of all vegetables
    if (getUserId(req, res)) {
        req.app.locals.db.query(`SELECT * FROM vegetable;`, (err, results, fields) => {
            if (err) {
                console.error(err);
                res.status(500).end();
            } else {
                res.setHeader("Content-Type", "application/json");
                res.status(200).end(JSON.stringify(results));
            }
        });
    }
});

apiRouter.post('/vegetable', (req, res, next) => {
    // CREATE vegetable
    let user_id = getUserId(req, res);
    if (user_id) {
        if (req.body.name != null && req.body.amount != null && req.body.cost != null) {
            req.app.locals.db.query(`INSERT INTO vegetable (user_id, name, amount, cost) VALUES (${user_id}, "${req.body.name}", ${req.body.amount}, ${req.body.cost});`, (err, results, fields) => {
                if (err) {
                    console.error(err);
                    res.status(500).end();
                } else {
                    req.app.locals.db.query(`SELECT * FROM vegetable WHERE user_id = ${user_id} AND name = "${req.body.name}" AND amount = ${req.body.amount} AND cost = ${req.body.cost};`, (err2, results2, fields) => {
                        if (err2) {
                            console.error(err2);
                            res.status(500).end();
                        } else {
                            res.setHeader("Content-Type", "application/json");
                            res.status(200).end(JSON.stringify(results2[0]));
                        }
                    });
                }
            });
        } else {
            res.status(400).end((req.body.name != null ? "" : "Missing input for 'name'.\n")
                                + (req.body.amount != null ? "" : "Missing input for 'amount'.\n")
                                + (req.body.cost != null ? "" : "Missing input for 'cost'.\n"));
        }
    }
});

apiRouter.get('/vegetable/:id', (req, res, next) => {
    // READ specific vegetable
    if (getUserId(req, res)) {
        req.app.locals.db.query(`SELECT * FROM vegetable WHERE vegetable_id = ${req.params.id};`, (err, results, fields) => {
            if (err) {
                console.error(err);
                res.status(500).end();
            } else {
                if (results.length > 0) {
                    res.setHeader("Content-Type", "application/json");
                    res.status(200).end(JSON.stringify(results[0]));
                } else {
                    res.status(404).end("Vegetable with ID " + req.params.id + " not found");
                }
            }
        });
    }
});

apiRouter.put('/vegetable/:id', (req, res, next) => {
    // UPDATE specific vegetable
    let user_id = getUserId(req, res);
    if (user_id) {
        if (req.body.name != null && req.body.amount != null && req.body.cost != null) {
            req.app.locals.db.query(`SELECT * FROM vegetable WHERE vegetable_id = ${req.params.id};`, (err, results, fields) => {
                if (err) {
                    console.error(err);
                    res.status(500).end();
                } else {
                    if (results.length > 0) {
                        if (results[0].user_id == user_id) {
                            req.app.locals.db.query(`UPDATE vegetable SET name = "${req.body.name}", amount = ${req.body.amount}, cost = ${req.body.cost} WHERE vegetable_id = ${req.params.id};`, (err2, results2, fields2) => {
                                if (err2) {
                                    console.error(err2);
                                    res.status(500).end();
                                } else {
                                    res.status(200).end("Vegetable with ID " + req.params.id + " updated");
                                }
                            });
                        } else {
                            res.status(403).end("Not allowed to update vegetable of another user");
                        }
                    } else {
                        res.status(404).end("Vegetable with ID " + req.params.id + " not found");
                    }
                }
            });
        } else {
            res.status(400).end((req.body.name != null ? "" : "Missing input for 'name'.\n")
                                + (req.body.amount != null ? "" : "Missing input for 'amount'.\n")
                                + (req.body.cost != null ? "" : "Missing input for 'cost'.\n"));
        }
    }
});

apiRouter.delete('/vegetable/:id', (req, res, next) => {
    // DELETE specific vegetable
    let user_id = getUserId(req, res);
    if (user_id) {
        req.app.locals.db.query(`SELECT * FROM vegetable WHERE vegetable_id = ${req.params.id};`, (err, results, fields) => {
            if (err) {
                console.error(err);
                res.status(500).end();
            } else {
                if (results.length > 0) {
                    if (results[0].user_id == user_id) {
                        req.app.locals.db.query(`DELETE FROM vegetable WHERE vegetable_id = ${req.params.id};`, (err2, results2, fields2) => {
                            if (err2) {
                                console.error(err2);
                                res.status(500).end();
                            } else {
                                res.status(200).end("Vegetable with ID " + req.params.id + " deleted");
                            }
                        });
                    } else {
                        res.status(403).end("Not allowed to delete vegetable of another user");
                    }
                } else {
                    res.status(404).end("Vegetable with ID " + req.params.id + " not found");
                }
            }
        });
    }
});

/* -------------------------------------------------- */
/* -------------------- SERVICES -------------------- */
/* -------------------------------------------------- */
apiRouter.get('/services', (req, res, next) => {
    // get list of all services
    if (getUserId(req, res)) {
        req.app.locals.db.query(`SELECT * FROM service;`, (err, results, fields) => {
            if (err) {
                console.error(err);
                res.status(500).end();
            } else {
                res.setHeader("Content-Type", "application/json");
                res.status(200).end(JSON.stringify(results));
            }
        });
    }
});

apiRouter.post('/service', (req, res, next) => {
    // CREATE service
    let user_id = getUserId(req, res);
    if (user_id) {
        if (req.body.name != null && req.body.description != null && req.body.cost != null) {
            req.app.locals.db.query(`INSERT INTO service (user_id, name, description, cost) VALUES (${user_id}, "${req.body.name}", "${req.body.description}", ${req.body.cost});`, (err, results, fields) => {
                if (err) {
                    console.error(err);
                    res.status(500).end();
                } else {
                    req.app.locals.db.query(`SELECT * FROM service WHERE user_id = ${user_id} AND name = "${req.body.name}" AND description = "${req.body.amount}" AND cost = ${req.body.cost};`, (err2, results2, fields) => {
                        if (err2) {
                            console.error(err2);
                            res.status(500).end();
                        } else {
                            res.setHeader("Content-Type", "application/json");
                            res.status(200).end(JSON.stringify(results2[0]));
                        }
                    });
                }
            });
        } else {
            res.status(400).end((req.body.name != null ? "" : "Missing input for 'name'.\n")
                                + (req.body.description != null ? "" : "Missing input for 'description'.\n")
                                + (req.body.cost != null ? "" : "Missing input for 'cost'.\n"));
        }
    }
});

apiRouter.get('/service/:id', (req, res, next) => {
    // READ specific service
    if (getUserId(req, res)) {
        req.app.locals.db.query(`SELECT * FROM service WHERE service_id = ${req.params.id};`, (err, results, fields) => {
            if (err) {
                console.error(err);
                res.status(500).end();
            } else {
                if (results.length > 0) {
                    res.setHeader("Content-Type", "application/json");
                    res.status(200).end(JSON.stringify(results[0]));
                } else {
                    res.status(404).end("Service with ID " + req.params.id + " not found");
                }
            }
        });
    }
});

apiRouter.put('/service/:id', (req, res, next) => {
    // UPDATE specific service
    let user_id = getUserId(req, res);
    if (user_id) {
        if (req.body.name != null && req.body.description != null && req.body.cost != null) {
            req.app.locals.db.query(`SELECT * FROM service WHERE service_id = ${req.params.id};`, (err, results, fields) => {
                if (err) {
                    console.error(err);
                    res.status(500).end();
                } else {
                    if (results.length > 0) {
                        if (results[0].user_id == user_id) {
                            req.app.locals.db.query(`UPDATE service SET name = "${req.body.name}", description = "${req.body.description}", cost = ${req.body.cost} WHERE service_id = ${req.params.id};`, (err2, results2, fields2) => {
                                if (err2) {
                                    console.error(err2);
                                    res.status(500).end();
                                } else {
                                    res.status(200).end("Service with ID " + req.params.id + " updated");
                                }
                            });
                        } else {
                            res.status(403).end("Not allowed to update service of another user");
                        }
                    } else {
                        res.status(404).end("Service with ID " + req.params.id + " not found");
                    }
                }
            });
        } else {
            res.status(400).end((req.body.name != null ? "" : "Missing input for 'name'.\n")
                                + (req.body.description != null ? "" : "Missing input for 'description'.\n")
                                + (req.body.cost != null ? "" : "Missing input for 'cost'.\n"));
        }
    }
});

apiRouter.delete('/service/:id', (req, res, next) => {
    // DELETE specific service
    let user_id = getUserId(req, res);
    if (user_id) {
        req.app.locals.db.query(`SELECT * FROM service WHERE service_id = ${req.params.id};`, (err, results, fields) => {
            if (err) {
                console.error(err);
                res.status(500).end();
            } else {
                if (results.length > 0) {
                    if (results[0].user_id == user_id) {
                        req.app.locals.db.query(`DELETE FROM service WHERE service_id = ${req.params.id};`, (err2, results2, fields2) => {
                            if (err2) {
                                console.error(err2);
                                res.status(500).end();
                            } else {
                                res.status(200).end("Service with ID " + req.params.id + " deleted");
                            }
                        });
                    } else {
                        res.status(403).end("Not allowed to delete service of another user");
                    }
                } else {
                    res.status(404).end("Service with ID " + req.params.id + " not found");
                }
            }
        });
    }
});

module.exports = apiRouter;
