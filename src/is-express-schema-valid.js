import createValidator from 'is-my-json-valid';

const defaultSchemas = ['payload', 'query', 'params'];
const schemaPattern = {type: 'object', required: true, additionalProperties: false};
const customFormats = {
    'mongo-object-id': /^[a-fA-F0-9]{24}$/i
};

class ValidationError extends Error {
    constructor(errorsObj) {
        super();
        this.name = 'ValidationError';
        this.statusCode = 400;
        this.statusText = 'Bad Request';
        this.errors = errorsObj;
        Error.captureStackTrace(this);
    }
}

function _createValidator (schema, schemaName, options) {
    if (!schema || typeof schema !== 'object') {
        throw new Error('Schema object is required for validator');
    }

    options = options || {};

    function parseValidatorErrors (errors) {
        return errors.map(error => {
            let key = error.field.split(/\.(.+)/)[1];
            let line = key || `${schemaName} data`;
            let err = {};

            if (key) {
                err.key = key;
            }

            err.message = `${line} ${error.message}`;

            if (options.debug) {
                err._raw = error;
            }

            return err;
        });
    }

    return (data, errors) => {
        let schemaToValidate = schema.type ? schema : Object.assign({}, schemaPattern, {properties: schema});
        let formats = options.formats ? Object.assign({}, customFormats, options.formats) : customFormats;
        let validator = createValidator(schemaToValidate, { formats });

        let validatedData = validator(data);

        if (!validatedData) {
            errors[schemaName] = parseValidatorErrors(validator.errors);
        }
    };
}

function requestValidator (schemas, options) {
    let schemaValidators = Object.keys(schemas)
        .filter(schemaName => {
            return defaultSchemas.indexOf(schemaName) > -1;
        })
        .reduce((memo, schemaName) => {
            memo[schemaName] = {
                validate: _createValidator(schemas[schemaName], schemaName, options)
            };
            return memo;
        }, {});

    return (req, res, next) => {
        let { params, query, payload } = schemaValidators;
        let errorsObj = {};

        if (params) {
            params.validate(req.params, errorsObj);
        }

        if (query) {
            query.validate(req.query, errorsObj);
        }

        if (payload) {
            payload.validate(req.body, errorsObj);
        }

        if (Object.keys(errorsObj).length > 0) {
            return next(new ValidationError(errorsObj));
        }

        next();
    };
}

function responseValidator () {} // TBD in next version

let defaultValidator = requestValidator;
defaultValidator.req = requestValidator;
defaultValidator.res = responseValidator;

export default defaultValidator;
