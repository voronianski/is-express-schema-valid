import { startServer, port } from './server';
import { expect } from 'chai';
import supertest from 'supertest';

const request = supertest(`http://localhost:${port}`);

describe('is-express-schema-valid middleware', () => {
    before(done => startServer(done));

    describe('when requesting with invalid schema', () => {
        describe('when sending wrong format', () => {
            it('should do what...');
        });

        describe('when missing one of the required fields', () => {
            it('should do what...');
        });

        describe('when missing both of the required fields', () => {
            it('should do what...');
        });

        describe('when sending fields that are not in schema', () => {
            it('should do what...');
        });

        describe('when sending invalid length', () => {
            it('should do what...');
        });
    });

    describe('when requesting with valid schema', () => {
        it('should do what...');
    });
});
