import { startServer, port } from './server';
import { expect } from 'chai';
import supertest from 'supertest';

const request = supertest(`http://localhost:${port}`);

describe('is-express-schema-valid middleware', () => {
    before(done => startServer(done));

    describe('when requesting with invalid schema', () => {
        describe('when sending wrong format', () => {
            it('should return proper error', done => {
                request
                    .post('/payload/object')
                    .send({email: 'invalid', password: '12345'})
                    .expect(400)
                    .expect(res => {
                        expect(res.body.errors).to.be.an('object');
                        expect(res.body.errors.payload).to.be.an('array');
                        expect(res.body.errors.payload.length).to.be.equal(1);
                    })
                    .end(done);
            });
        });

        describe('when missing one of the required fields', () => {
            it('should return proper error', done => {
                request
                    .post('/payload/object')
                    .send({email: 'john.doe@example.com'})
                    .expect(400)
                    .expect(res => {
                        expect(res.body.errors).to.be.an('object');
                        expect(res.body.errors.payload).to.be.an('array');
                        expect(res.body.errors.payload.length).to.be.equal(1);
                    })
                    .end(done);
            });
        });

        describe('when missing both of the required fields', () => {
            it('should return proper error', done => {
                request
                    .post('/payload/object')
                    .send({email: 'invalid'})
                    .expect(400)
                    .expect(res => {
                        expect(res.body.errors).to.be.an('object');
                        expect(res.body.errors.payload).to.be.an('array');
                        expect(res.body.errors.payload.length).to.be.equal(2);
                    })
                    .end(done);
            });
        });

        describe('when sending fields that are not in schema', () => {
            it('should return proper error', done => {
                request
                    .post('/payload/object')
                    .send({foo: 'bar', bar: 'foo'})
                    .expect(400)
                    .expect(res => {
                        expect(res.body.errors).to.be.an('object');
                        expect(res.body.errors.payload).to.be.an('array');
                        expect(res.body.errors.payload.length).to.be.equal(3);
                    })
                    .end(done);
            });
        });

        describe('when sending invalid query and payload in the same time', () => {
            it('should return proper error', done => {
                request
                    .post('/mixed?num=string')
                    .send({foo: 'bar'})
                    .expect(400)
                    .expect(res => {
                        expect(res.body.errors).to.be.an('object');
                        expect(res.body.errors.query).to.be.an('array');
                        expect(res.body.errors.query.length).to.be.equal(1);
                        expect(res.body.errors.payload).to.be.an('array');
                        expect(res.body.errors.payload.length).to.be.equal(1);
                    })
                    .end(done);
            });
        });

        describe('when requesting with invalid mongo objectId as param', () => {
            it('should return proper error', done => {
                request
                    .get('/params/string')
                    .expect(400)
                    .expect(res => {
                        expect(res.body.errors).to.be.an('object');
                        expect(res.body.errors.params).to.be.an('array');
                        expect(res.body.errors.params.length).to.be.equal(1);
                    })
                    .end(done);
            });
        });
    });

    describe('when requesting with valid schema', () => {
            it('should return success', done => {
                request
                    .post('/payload/object')
                    .send({email: 'john.doe@example.com', password: 'qwerty'})
                    .expect(200)
                    .end(done);
            });
    });
});
