const assert = require('assert');
const needle = require('needle');

function runTests() {
    needle.request("post", 'http://localhost:7878/api/login', {username:"marko", password:"marko"}, (errSid, resSid) => {
        // no assertions, used only for LOGIN to get sid
        let sid = resSid.body.sid;

        // GET services
        needle.request("get", 'http://localhost:7878/api/services', {sid:sid}, {json:true}, (err, res) => {
            assert.strictEqual(res.statusCode, 200);
            //console.table(res.body);
            assert.strictEqual(res.body.length, 5); // returns all services (5)
        });

        // POST
        needle.request("post", 'http://localhost:7878/api/service', {sid:sid, description:"ddsc"}, {json:true}, (err, res) => {
            assert.strictEqual(res.statusCode, 400);
            assert.strictEqual(res.body.toString('utf8'), "Missing input for 'name'.\nMissing input for 'cost'.\n");
        });

        // GET service
        needle.request("get", 'http://localhost:7878/api/service/2', {sid:sid}, {json:true}, (err, res) => {
            assert.strictEqual(res.statusCode, 200);
            //console.table(res.body);
            assert.deepStrictEqual(res.body, {service_id:2, user_id:1, name:"Oranje (do 5 km2)", description:"Oranje srednjih polja, velicine do 5 kilometara kvadratnih.", cost:1500});
        });

        needle.request("get", 'http://localhost:7878/api/service/-1', {sid:sid}, {json:true}, (err, res) => {
            assert.strictEqual(res.statusCode, 404);
            assert.strictEqual(res.body.toString('utf8'), "Service with ID -1 not found");
        });

        // PUT
        needle.request("put", 'http://localhost:7878/api/service/2', {sid:sid}, {json:true}, (err, res) => {
            assert.strictEqual(res.statusCode, 400);
            assert.strictEqual(res.body.toString('utf8'), "Missing input for 'name'.\nMissing input for 'description'.\nMissing input for 'cost'.\n");
        });

        needle.request("put", 'http://localhost:7878/api/service/2', {sid:sid, name:"name", description:"ddsc", cost:0}, {json:true}, (err, res) => {
            assert.strictEqual(res.statusCode, 403);
            assert.strictEqual(res.body.toString('utf8'), "Not allowed to update service of another user");
        });

        needle.request("put", 'http://localhost:7878/api/service/-1', {sid:sid, name:"name", description:"ddsc", cost:0}, {json:true}, (err, res) => {
            assert.strictEqual(res.statusCode, 404);
            assert.strictEqual(res.body.toString('utf8'), "Service with ID -1 not found");
        });

        // DELETE
        needle.request("delete", 'http://localhost:7878/api/service/2', {sid:sid}, {json:true}, (err, res) => {
            assert.strictEqual(res.statusCode, 403);
            assert.strictEqual(res.body.toString('utf8'), "Not allowed to delete service of another user");
        });

        needle.request("delete", 'http://localhost:7878/api/service/-1', {sid:sid}, {json:true}, (err, res) => {
            assert.strictEqual(res.statusCode, 404);
            assert.strictEqual(res.body.toString('utf8'), "Service with ID -1 not found");
        });

        // LOGOUT
        needle.request("post", 'http://localhost:7878/api/logout', {sid:sid});
    });
}

module.exports = runTests;
