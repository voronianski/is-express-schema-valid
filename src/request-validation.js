import createValidator from 'is-my-json-valid';

const defaultSchemas = ['payload', 'query', 'params'];
const schemaPattern = {type: 'object', 'additionalProperties': false};

class ValidationError extends Error {
    constructor() {
        super();
        this.status = 400;
        this.statusText = 'Bad Request';
        Error.captureStackTrace(this);
    }
}

export default function (schemas) {
    let schemaValidators = Object.keys(schemas)
        .filter(schemaName => {
            return defaultSchemas.indexOf(schemaName) > -1;
        })
        .reduce((memo, schemaName) => {
            const schema = Object.assign({}, schemaPattern, {properties: schemas[schemaName]});
            memo[schemaName] = createValidator(schema);
            return memo;
        }, {});

    return (req, res, next) => {

    };
}
