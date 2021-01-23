const assert = require('assert');
const needle = require('needle');

function runTests() {
    needle.request("post", 'http://localhost:7878/api/login', {username:"marko", password:"marko"}, (errSid, resSid) => {
        // no assertions, used only for LOGIN to get sid
        let sid = resSid.body.sid;

        needle.request("get", 'http://localhost:7878/api/users', {sid:sid}, {json:true}, (err, res) => {
            assert.strictEqual(res.statusCode, 200);
            //console.table(res.body);
            assert.strictEqual(res.body.length, 3); // returns 3 users
        });

        needle.request("get", 'http://localhost:7878/api/user/1/vegetables', {sid:sid}, {json:true}, (err, res) => {
            assert.strictEqual(res.statusCode, 200);
            //console.table(res.body);
            assert.strictEqual(res.body.length, 6); // returns 5 vegetables for user with ID 1
        });

        needle.request("get", 'http://localhost:7878/api/user/1/services', {sid:sid}, {json:true}, (err, res) => {
            assert.strictEqual(res.statusCode, 200);
            //console.table(res.body);
            assert.strictEqual(res.body.length, 3); // returns 3 services for user with ID 1
        });

        // LOGOUT
        needle.request("post", 'http://localhost:7878/api/logout', {sid:sid});
    });
}

module.exports = runTests;
