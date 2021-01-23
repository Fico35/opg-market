const assert = require('assert');
const needle = require('needle');

function runTests() {
    needle.request("post", 'http://localhost:7878/api/login', {username:"marko", password:"marko"}, (errSid, resSid) => {
        // no assertions, used only for LOGIN to get sid
        let sid = resSid.body.sid;

        // GET vegetables
        needle.request("get", 'http://localhost:7878/api/vegetables', {sid:sid}, {json:true}, (err, res) => {
            assert.strictEqual(res.statusCode, 200);
            //console.table(res.body);
            assert.strictEqual(res.body.length, 14); // returns all vegetables (14)
        });

        // POST
        needle.request("post", 'http://localhost:7878/api/vegetable', {sid:sid, amount:22}, {json:true}, (err, res) => {
            assert.strictEqual(res.statusCode, 400);
            assert.strictEqual(res.body.toString('utf8'), "Missing input for 'name'.\nMissing input for 'cost'.\n");
        });

        // GET vegetable
        needle.request("get", 'http://localhost:7878/api/vegetable/2', {sid:sid}, {json:true}, (err, res) => {
            assert.strictEqual(res.statusCode, 200);
            //console.table(res.body);
            assert.deepStrictEqual(res.body, {vegetable_id:2, user_id:1, name:"kupus (crveni)", amount:50, cost:200});
        });

        needle.request("get", 'http://localhost:7878/api/vegetable/-1', {sid:sid}, {json:true}, (err, res) => {
            assert.strictEqual(res.statusCode, 404);
            assert.strictEqual(res.body.toString('utf8'), "Vegetable with ID -1 not found");
        });

        // PUT
        needle.request("put", 'http://localhost:7878/api/vegetable/2', {sid:sid}, {json:true}, (err, res) => {
            assert.strictEqual(res.statusCode, 400);
            assert.strictEqual(res.body.toString('utf8'), "Missing input for 'name'.\nMissing input for 'amount'.\nMissing input for 'cost'.\n");
        });

        needle.request("put", 'http://localhost:7878/api/vegetable/2', {sid:sid, name:"name", amount:0, cost:0}, {json:true}, (err, res) => {
            assert.strictEqual(res.statusCode, 403);
            assert.strictEqual(res.body.toString('utf8'), "Not allowed to update vegetable of another user");
        });

        needle.request("put", 'http://localhost:7878/api/vegetable/-1', {sid:sid, name:"name", amount:0, cost:0}, {json:true}, (err, res) => {
            assert.strictEqual(res.statusCode, 404);
            assert.strictEqual(res.body.toString('utf8'), "Vegetable with ID -1 not found");
        });

        // DELETE
        needle.request("delete", 'http://localhost:7878/api/vegetable/2', {sid:sid}, {json:true}, (err, res) => {
            assert.strictEqual(res.statusCode, 403);
            assert.strictEqual(res.body.toString('utf8'), "Not allowed to delete vegetable of another user");
        });

        needle.request("delete", 'http://localhost:7878/api/vegetable/-1', {sid:sid}, {json:true}, (err, res) => {
            assert.strictEqual(res.statusCode, 404);
            assert.strictEqual(res.body.toString('utf8'), "Vegetable with ID -1 not found");
        });

        // LOGOUT
        needle.request("post", 'http://localhost:7878/api/logout', {sid:sid});
    });
}

module.exports = runTests;
