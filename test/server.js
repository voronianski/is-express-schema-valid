import http from 'http';
import express from 'express';
import validate from '../src/is-express-schema-valid';

const app = express();

const loginSchema = {
    email: {
        type: 'string',
        format: 'email',
        required: true
    },
    password: {
        type: 'string',
        required: true,
        minLength: 1
    }
};

app.post('/login',
    validate(loginSchema),
    findAndLoginUser
);
app.use(handleErrors);

function findAndLoginUser (req, res, next) {
}

function handleErrors (err, req, res, next) {
}

export const port = 8765;

export function startServer (callback) {
    http.createServer(app).listen(port, callback);
}

