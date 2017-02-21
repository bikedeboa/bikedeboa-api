let request = require('supertest')
let app = require('../../../app')
let chai = require('chai')

describe('Tag', function () {
  let token = null

  before(function (done) {
    request(app)
      .post('/token')
      .send({
        username: 'testuser',
        password: '123456'
      })
      .end(function (err, res) {
        token = res.body.token
        done()
      })
  })

  it('GET /tag', function (done) {
    request(app)
      .get('/tag')
      .set('Accept', 'application/json')
      .set('x-access-token', token)
      .expect('Content-Type', /json/)
      .expect(200)
      .end(function (err, res) {
        done(err)
      })
  })
})
