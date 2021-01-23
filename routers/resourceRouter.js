const { Router } = require('express');

const resourceRouter = Router();

function getUserId(req, res) {
    if (req.signedCookies.sid != null) {
        if (req.app.locals.sessionMap.has(req.signedCookies.sid)) {
            let currentTime = new Date().getTime();
            if (currentTime < req.app.locals.sessionMap.get(req.signedCookies.sid).expires.getTime()) {
                return req.app.locals.sessionMap.get(req.signedCookies.sid).user_id;
            } else {
                // session has expired
                req.app.locals.sessionMap.delete(req.signedCookies.sid);
            }
        }
    }
    res.status(401).end();
    return false;
}

/* -------------------------------------------------- */
/* ---------------------- USERS --------------------- */
/* -------------------------------------------------- */
resourceRouter.get('/users', (req, res, next) => {
    // get list of all users
    let user_id = getUserId(req, res);
    if (user_id) {
        req.app.locals.db.query(`SELECT user_id, username, opg_name FROM user;`, (err, results, fields) => {
            if (err) {
                console.error(err);
                res.status(500).end();
            } else {
                res.status(200).json(dbResultsToDatatableJson(results, fields));
            }
        });
    }
});

resourceRouter.get('/user/:id/vegetables', (req, res, next) => {
    // get vegetables of specific user
    let user_id = getUserId(req, res);
    if (user_id) {
        req.app.locals.db.query(`SELECT vegetable_id, opg_name, name, amount, cost, (cost / amount) AS cost_per_kg FROM vegetable JOIN user ON vegetable.user_id = user.user_id WHERE vegetable.user_id = ${req.params.id};`, (err, results, fields) => {
            if (err) {
                console.error(err);
                res.status(500).end();
            } else {
                res.status(200).json(dbResultsToDatatableJson(results, fields));
            }
        });
    }
});

resourceRouter.get('/user/:id/services', (req, res, next) => {
    // get services of specific user
    let user_id = getUserId(req, res);
    if (user_id) {
        req.app.locals.db.query(`SELECT service_id, opg_name, name, description, cost FROM service JOIN user ON service.user_id = user.user_id WHERE service.user_id = ${req.params.id};`, (err, results, fields) => {
            if (err) {
                console.error(err);
                res.status(500).end();
            } else {
                res.status(200).json(dbResultsToDatatableJson(results, fields));
            }
        });
    }
});

/* -------------------------------------------------- */
/* ------------------- VEGETABLES ------------------- */
/* -------------------------------------------------- */
resourceRouter.get('/vegetables', (req, res, next) => {
    // get list of all vegetables
    let user_id = getUserId(req, res);
    if (user_id) {
        req.app.locals.db.query(`SELECT vegetable_id, opg_name, name, amount, cost, (cost / amount) AS cost_per_kg FROM vegetable JOIN user ON vegetable.user_id = user.user_id;`, (err, results, fields) => {
            if (err) {
                console.error(err);
                res.status(500).end();
            } else {
                res.status(200).json(dbResultsToDatatableJson(results, fields));
            }
        });
    }
});

resourceRouter.post('/vegetable', (req, res, next) => {
    // CREATE vegetable
    let user_id = getUserId(req, res);
    if (user_id) {
        if (req.body.name != null && req.body.amount != null && req.body.cost != null) {
            req.app.locals.db.query(`INSERT INTO vegetable (user_id, name, amount, cost) VALUES (${user_id}, "${req.body.name}", ${req.body.amount}, ${req.body.cost});`, (err, results, fields) => {
                if (err) {
                    console.error(err);
                    res.status(500).end();
                } else {
                    res.status(200).end();
                }
            });
        } else {
            res.status(400).end();
        }
    }
});

resourceRouter.get('/vegetable/:id', (req, res, next) => {
    // READ specific vegetable
    let user_id = getUserId(req, res);
    if (user_id) {
        req.app.locals.db.query(`SELECT * FROM vegetable WHERE vegetable_id = ${req.params.id};`, (err, results, fields) => {
            if (err) {
                console.error(err);
                res.status(500).end();
            } else {
                if (results.length === 0) {
                    res.status(404).end();
                } else {
                    res.setHeader("Content-Type", "application/json");
                    res.send(JSON.stringify(results[0]));
                }
            }
        });
    }
});

resourceRouter.put('/vegetable/:id', (req, res, next) => {
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
                                    res.status(200).end();
                                }
                            });
                        } else {
                            res.status(403).end();
                        }
                    } else {
                        res.status(404).end();
                    }
                }
            });
        } else {
            res.status(400).end();
        }
    }
});

resourceRouter.delete('/vegetable/:id', (req, res, next) => {
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
                                res.status(200).end();
                            }
                        });
                    } else {
                        res.status(403).end();
                    }
                } else {
                    res.status(404).end();
                }
            }
        });
    }
});

/* -------------------------------------------------- */
/* -------------------- SERVICES -------------------- */
/* -------------------------------------------------- */
resourceRouter.get('/services', (req, res, next) => {
    // get list of all services
    let user_id = getUserId(req, res);
    if (user_id) {
        req.app.locals.db.query(`SELECT service_id, opg_name, name, description, cost FROM service JOIN user ON service.user_id = user.user_id;`, (err, results, fields) => {
            if (err) {
                console.error(err);
                res.status(500).end();
            } else {
                res.status(200).json(dbResultsToDatatableJson(results, fields));
            }
        });
    }
});

resourceRouter.post('/service', (req, res, next) => {
    // CREATE service
    let user_id = getUserId(req, res);
    if (user_id) {
        if (req.body.name != null && req.body.description != null && req.body.cost != null) {
            req.app.locals.db.query(`INSERT INTO service (user_id, name, description, cost) VALUES (${user_id}, "${req.body.name}", "${req.body.description}", ${req.body.cost});`, (err, results, fields) => {
                if (err) {
                    console.error(err);
                    res.status(500).end();
                } else {
                    res.status(200).end();
                }
            });
        } else {
            res.status(400).end();
        }
    }
});

resourceRouter.get('/service/:id', (req, res, next) => {
    // READ specific service
    let user_id = getUserId(req, res);
    if (user_id) {
        req.app.locals.db.query(`SELECT * FROM service WHERE service_id = ${req.params.id};`, (err, results, fields) => {
            if (err) {
                console.error(err);
                res.status(500).end();
            } else {
                if (results.length === 0) {
                    res.status(404).end();
                } else {
                    res.setHeader("Content-Type", "application/json");
                    res.send(JSON.stringify(results[0]));
                }
            }
        });
    }
});

resourceRouter.put('/service/:id', (req, res, next) => {
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
                                    res.status(200).end();
                                }
                            });
                        } else {
                            res.status(403).end();
                        }
                    } else {
                        res.status(404).end();
                    }
                }
            });
        } else {
            res.status(400).end();
        }
    }
});

resourceRouter.delete('/service/:id', (req, res, next) => {
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
                                res.status(200).end();
                            }
                        });
                    } else {
                        res.status(403).end();
                    }
                } else {
                    res.status(404).end();
                }
            }
        });
    }
});

function dbResultsToDatatableJson(results, fields) {
    let data = [];
    for (let result of results) {
        let row = [];
        for (let field of fields) {
            row.push(String(result[field.name]));
        }
        data.push(row);
    }
    return data;
}

module.exports = resourceRouter;
