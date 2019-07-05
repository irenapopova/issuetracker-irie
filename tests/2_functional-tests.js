/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       (if additional are added, keep them at the very end!)
*/

const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');
const Issue = require('../models/Issue');

chai.use(chaiHttp);

suite('Functional Tests', function() {
  let idEveryFilled, idRequiredFilled;

  suite('POST /api/issues/{project} => object with issue data', function() {
    test('Every field filled in', function(done) {
      chai
        .request(server)
        .post('/api/issues/test')
        .send({
          issue_title: 'Title',
          issue_text: 'text',
          created_by: 'Functional Test - Every field filled in',
          assigned_to: 'Chai and Mocha',
          status_text: 'In QA'
        })
        .end(function(err, res) {
          assert.equal(res.status, 200);

          const {
            issue_title,
            issue_text,
            created_by,
            assigned_to,
            status_text,
            created_on,
            updated_on,
            open,
            _id
          } = res.body;

          idEveryFilled = _id;

          assert.equal(issue_title, 'Title');
          assert.equal(issue_text, 'text');
          assert.equal(created_by, 'Functional Test - Every field filled in');
          assert.equal(assigned_to, 'Chai and Mocha');
          assert.equal(status_text, 'In QA');
          assert.isDefined(_id, '_id undefined');
          assert.isDefined(created_on, 'created_on undefined');
          assert.isDefined(updated_on, 'updated_on undefined');
          assert.isDefined(open, 'open undefined');

          Issue.findById(_id, (err, item) => {
            assert.isNotOk(err);
            assert.isOk(item, `could not find item with id of ${_id}`);
            done();
          });
        });
    });

    test('Required fields filled in', function(done) {
      chai
        .request(server)
        .post('/api/issues/test')
        .send({
          issue_title: 'Title',
          issue_text: 'text',
          created_by: 'Functional Test - Every field filled in'
        })
        .end(function(err, res) {
          assert.equal(res.status, 200);

          const {
            issue_title,
            issue_text,
            created_by,
            created_on,
            updated_on,
            open,
            _id
          } = res.body;

          assert.equal(issue_title, 'Title');
          assert.equal(issue_text, 'text');
          assert.equal(created_by, 'Functional Test - Every field filled in');
          assert.isDefined(_id, '_id undefined');
          assert.isDefined(created_on, 'created_on undefined');
          assert.isDefined(updated_on, 'updated_on undefined');
          assert.isDefined(open, 'open undefined');

          idRequiredFilled = _id;

          Issue.findById(_id, (err, item) => {
            const errMsg = `could not find item with id of ${_id}`;
            assert.isNotOk(err);
            assert.isOk(item, errMsg);

            done();
          });
        });
    });

    test('Missing required fields', function(done) {
      chai
        .request(server)
        .post('/api/issues/test')
        .send({
          issue_text: 'text',
          created_by: 'Functional Test - Every field filled in'
        })
        .end(function(err, res) {
          assert.equal(res.status, 400); // bad request

          done();
        });
    });
  });

  suite('PUT /api/issues/{project} => text', function() {
    test('No body', function(done) {
      chai
        .request(server)
        .put('/api/issues/test')
        .send({})
        .end(function(err, res) {
          assert.equal(res.text, 'no updated field sent');
          done();
        });
    });

    test('One field to update', function(done) {
      chai
        .request(server)
        .put('/api/issues/test')
        .send({
          _id: idEveryFilled
        })
        .end(function(err, res) {
          assert.equal(res.text, 'no updated field sent');
          done();
        });
    });

    test('Multiple fields to update', function(done) {
      chai
        .request(server)
        .put('/api/issues/test')
        .send({
          _id: idEveryFilled,
          issue_text: 'My name is Danilo, what is your name?',
          issue_title: 'Introduction'
        })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.text, 'successfully updated');
          Issue.findById(idEveryFilled, (err, item) => {
            assert.equal(
              item.issue_text,
              'My name is Danilo, what is your name?'
            );
            assert.equal(item.issue_title, 'Introduction');
            done();
          });
        });
    });
  });

  suite(
    'GET /api/issues/{project} => Array of objects with issue data',
    function() {
      test('No filter', function(done) {
        chai
          .request(server)
          .get('/api/issues/test')
          .query({})
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.isArray(res.body);
            assert.property(res.body[0], 'issue_title');
            assert.property(res.body[0], 'issue_text');
            assert.property(res.body[0], 'created_on');
            assert.property(res.body[0], 'updated_on');
            assert.property(res.body[0], 'created_by');
            assert.property(res.body[0], 'assigned_to');
            assert.property(res.body[0], 'open');
            assert.property(res.body[0], 'status_text');
            assert.property(res.body[0], '_id');
            done();
          });
      });

      test('One filter', function(done) {
        chai
          .request(server)
          .get('/api/issues/test')
          .query({
            open: true
          })
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.isArray(res.body);
            assert.isAtLeast(res.body.length, 2);
            for (let item of res.body) {
              assert.isTrue(item.open);
            }
            done();
          });
      });

      test('Multiple filters (test for multiple fields you know will be in the db for a return)', function(done) {
        chai
          .request(server)
          .get('/api/issues/test')
          .query({
            open: true,
            created_by: 'Functional Test - Every field filled in'
          })
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.isArray(res.body);
            assert.isAtLeast(res.body.length, 2);
            for (let item of res.body) {
              assert.equal(
                item.created_by,
                'Functional Test - Every field filled in'
              );
              assert.isTrue(item.open);
            }
            done();
          });
      });
    }
  );

  suite('DELETE /api/issues/{project} => text', function() {
    test('No _id', function(done) {
      chai
        .request(server)
        .delete('/api/issues/test')
        .send({})
        .end(function(err, res) {
          assert.equal(res.text, '_id error');
          done();
        });
    });

    test('Valid _id', function(done) {
      chai
        .request(server)
        .delete('/api/issues/test')
        .send({
          _id: idEveryFilled
        })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.text, 'deleted ' + idEveryFilled);
          Issue.findById(idEveryFilled, (err, item) => {
            assert.notOk(item, 'item should be deleted, but it is not!');
            done();
          });
        });
    });
  });
});
