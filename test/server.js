import http from 'http';
import express from 'express';
import bodyParser from 'body-parser';
import validate from '../src/is-express-schema-valid';
import {
    payloadObjSchema,
    payloadObjSchemaWithReadonly,
    payloadNestedObjSchema,
    payloadArrSchema,
    mixedSchema,
    paramsSchema
} from './schemas';

const app = express();

app.use(bodyParser.json());
app.post('/payload/object',
    validate(payloadObjSchema),
    returnSuccess
);
app.post('/payload/object/filterReadonly',
    validate(payloadObjSchemaWithReadonly, { filterReadonly: true }),
    returnBody
);
app.post('/payload/object/nested',
    validate(payloadNestedObjSchema),
    returnSuccess
);
app.post('/payload/array',
    validate(payloadArrSchema),
    returnSuccess
);
app.post('/mixed',
    validate(mixedSchema),
    returnSuccess
);
app.get('/params/:id',
    validate(paramsSchema),
    returnSuccess
);
app.use(handleErrors);

function returnSuccess (req, res) {
    res.status(200).end();
}

function returnBody (req, res) {
    res.json(req.body);
}

function handleErrors (err, req, res, next) {
    let status = err.name === 'SchemaValidationError' ? 400 : err.status || 500;
    let errors = err.name === 'SchemaValidationError' ? err.errors : {message: 'Internal Server Error'};

    res.status(status).json({ errors });
}

export const port = 8765;

export function startServer (callback) {
    http.createServer(app).listen(port, callback);
}
