import createValidator from 'is-my-json-valid';

const defaultSchemas = ['payload', 'query', 'params'];
const schemaPattern = {type: 'object', required: true, additionalProperties: false};

class ValidationError extends Error {
    constructor(errorsList) {
        super();
        this.name = 'ValidationError';
        this.status = 400;
        this.statusText = 'Bad Request';
        this.errors = errorsList;
        Error.captureStackTrace(this);
    }
}

function _parseValidatorErrors (errors) {
    return errors.reduce((memo, error) => {
        memo: {
            name: 'ValidationError',
            raw: error
        };
        return memo;
    }, {});
}

function _createValidator (schema) {
    if (!schema || typeof schema !== 'object') {
        throw new Error('Schema object is required for validator');
    }

    return (data, errors) => {
        const schemaToValidate = schema.type ? schema : Object.assign({}, schemaPattern, {properties: schema});
        const validator = createValidator(schemaToValidate);

        let validatedData = validator(data);

        if (!validatedData) {
            errors.push(_parseValidatorErrors(validator.errors));
        }
    };
}

function requestValidator (schemas) {
    let schemaValidators = Object.keys(schemas)
        .filter(schemaName => {
            return defaultSchemas.indexOf(schemaName) > -1;
        })
        .reduce((memo, schemaName) => {
            memo[schemaName] = {
                validate: _createValidator(schemas[schemaName])
            };
            return memo;
        }, {});

    return (req, res, next) => {
        let { params, query, payload } = schemaValidators;
        let errorsList = [];

        if (params) {
            params.validate(req.params, errorsList);
        }

        if (query) {
            query.validate(req.query, errorsList);
        }

        if (payload) {
            payload.validate(req.body, errorsList);
        }

        if (errorsList.length > 0) {
            return next(new ValidationError(errorsList));
        }

        next();
    };
}

function responseValidator () {} // TBD in next version

let defaultValidator = requestValidator;
defaultValidator.req = requestValidator;
defaultValidator.res = responseValidator;

export default defaultValidator;
