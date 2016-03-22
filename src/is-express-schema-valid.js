import validate from 'is-my-schema-valid';
import errorClass from 'error-class';

const defaultSchemas = ['payload', 'query', 'params'];

const SchemaValidationError = errorClass('SchemaValidationError');

function createValidator (schemaName, schema, options) {
    return (data, errors) => {
        const result = validate(data, schema, options);

        if (!result.valid) {
            errors[schemaName] = result.errors;
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
                validate: createValidator(schemaName, schemas[schemaName], options)
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
            const schemaValidationError = new SchemaValidationError();
            schemaValidationError.errors = errorsObj;
            return next(schemaValidationError);
        }

        next();
    };
}

function responseValidator () {} // TBD in next version

let defaultValidator = requestValidator;
defaultValidator.req = requestValidator;
defaultValidator.res = responseValidator;
defaultValidator.SchemaValidationError = SchemaValidationError;

export default defaultValidator;
