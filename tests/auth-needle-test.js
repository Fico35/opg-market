const assert = require('assert');
const needle = require('needle');

function runTests() {
    needle.request("post", 'http://localhost:7878/api/login', {username:"marko", password:"marko"}, (err, res) => {
        assert.strictEqual(res.statusCode, 200);
        assert.ok(/[0-9a-f]{256}/g.test(res.body.sid));
        assert.ok(/[0-9]{4}-[0-1][0-9]-[0-3][0-9]T[0-2][0-9]:[0-5][0-9]:[0-5][0-9].[0-9]{3}Z/g.test(res.body.expires));
        assert.strictEqual(res.body.user_id, 2);

        needle.request("post", 'http://localhost:7878/api/logout', {sid:res.body.sid}, (err, res) => {
            assert.strictEqual(res.statusCode, 200);
            assert.strictEqual(res.body.toString('utf8'), "Logged out");
        });
    });

    needle.request("post", 'http://localhost:7878/api/login', {password:"rrr"}, (err, res) => {
        assert.strictEqual(res.statusCode, 400);
        assert.strictEqual(res.body.toString('utf8'), "Missing input for 'username'.\n");
    });

    needle.request("post", 'http://localhost:7878/api/login', {username:"rrr", password:"rrr"}, (err, res) => {
        assert.strictEqual(res.statusCode, 401);
        assert.strictEqual(res.body.toString('utf8'), "Username doesn't exist");
    });

    needle.request("post", 'http://localhost:7878/api/login', {username:"marko", password:"rrr"}, (err, res) => {
        assert.strictEqual(res.statusCode, 401);
        assert.strictEqual(res.body.toString('utf8'), "Incorrect password!");
    });

    needle.request("post", 'http://localhost:7878/api/register', {password:"marko", opg_name:"marko"}, (err, res) => {
        assert.strictEqual(res.statusCode, 400);
        assert.strictEqual(res.body.toString('utf8'), "Missing input for 'username'.\n");
    });

    needle.request("post", 'http://localhost:7878/api/register', {username:"marko", password:"marko", opg_name:"marko"}, (err, res) => {
        assert.strictEqual(res.statusCode, 403);
        assert.strictEqual(res.body.toString('utf8'), "Username already exists!");
    });

    needle.request("post", 'http://localhost:7878/api/logout', {}, (err, res) => {
        assert.strictEqual(res.statusCode, 400);
        assert.strictEqual(res.body.toString('utf8'), "Missing session ID ('sid' field in request body)");
    });

    // not actually requests to an AUTH URI, but can be any URI, just to check for improper sid
    needle.request("get", 'http://localhost:7878/api/users', {sid:"rrr"}, {json:true}, (err, res) => {
        assert.strictEqual(res.statusCode, 401);
        assert.strictEqual(res.body.toString('utf8'), "Session ID is not valid");
    });

    needle.request("get", 'http://localhost:7878/api/users', {}, {json:true}, (err, res) => {
        assert.strictEqual(res.statusCode, 400);
        assert.strictEqual(res.body.toString('utf8'), "Missing session ID ('sid' field in request body)");
    });
}

module.exports = runTests;
