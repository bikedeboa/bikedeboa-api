var request = require('supertest'),
    app     = require('../../../app'),
    models  = require('../../../models'),
    chai    = require('chai'),
    assert  = chai.assert,
    expect  = chai.expect,
    debug   = require('debug')('api:ctrlUserTest');

describe("AuthController", function() {
  this.timeout(15000);
  var token = null;

  before(function(done) {
    request(app)
      .post('/token')
      .send({
          username: "testuser",
          password: "123456"
      })
      .end(function(err, res) {
        token = res.body.token;
        done();
      });
  });

  describe("User", function() {
    it("delete all users", function(done) {
      request(app)
        .delete("/user")
        .set('x-access-token', token)
        .send()
        .expect(200)
        .end(function(err, res) {
          done(err);
        });
      });

    it("create user fake", function(done) {
      request(app)
        .post("/user")
        .set('x-access-token', token)
        .send({
            fullname: "Test Lastname",
            username: "testuser",
            password: "123456",
            role: "admin"
        })
        .expect(200)
        .end(function(err, res) {
          done(err);
        });
      });
  });

  describe("status 200", function() {
    it("returns authenticated user token", function(done) {
      request(app)
        .post("/token")
        .set('x-access-token', token)
        .send({
          username: "testuser",
          password: "123456"
        })
        .expect(200)
        .end(function(err, res) {
          expect(res.body).to.include.keys("token");
          done(err);
        });
      });
  });

  describe("status 400", function() {
    it("throws error when email and password are blank", function(done) {
      request(app)
        .post("/token")
        .set('x-access-token', token)
        .expect(400)
        .end(function(err, res) {
          done(err);
        });
    });
  });

  describe("status 401", function() {
    it("throws error when password is incorrect", function(done) {
      request(app)
        .post("/token")
        .set('x-access-token', token)
        .send({
          username: "testuser",
          password: "SENHA_ERRADA"
        })
        .expect(401)
        .end(function(err, res) {
          done(err);
        });
    });
  });

  describe("status 404", function() {
    it("throws error when email not exist", function(done) {
      request(app)
        .post("/token")
        .set('x-access-token', token)
        .send({
          username: "EMAIL_ERRADO",
          password: "SENHA_ERRADA"
        })
        .expect(404)
        .end(function(err, res) {
          done(err);
        });
    });
  });
});
