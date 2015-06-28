import http from 'http';
import express from 'express';
import bodyParser from 'body-parser';
import validate from '../src/is-express-schema-valid';

const app = express();

const payloadObjSchema = {
    payload: {
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
    }
};

const payloadArrSchema = {
    payload: {
        type: 'array',
        uniqueItems: true,
        items: {
            type: 'number'
        }
    }
};

app.use(bodyParser.json());
app.post('/payload/object',
    validate(payloadObjSchema),
    returnSuccess
);
app.post('/payload/array',
    validate(payloadArrSchema),
    returnSuccess
);
app.use(handleErrors);

function returnSuccess (req, res) {
    res.status(200).end();
}

function handleErrors (err, req, res, next) {
    console.log(err);
    console.log(err.errors);
}

export const port = 8765;

// export function startServer (callback) {
    http.createServer(app).listen(port, () => {});
// }

