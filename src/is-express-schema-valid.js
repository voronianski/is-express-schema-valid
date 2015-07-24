import createValidator from 'is-my-json-valid';
import traverse from 'traverse';
import uniqueBy from 'unique-by';

const defaultSchemas = ['payload', 'query', 'params'];
const schemaPattern = {type: 'object', required: true, additionalProperties: false};
const customFormats = {
    'mongo-object-id': /^[a-fA-F0-9]{24}$/i,
    'alpha': /^[A-Z]+$/i,
    'alphanumeric': /^[0-9A-Z]+$/i,
    'numeric': /^[-+]?[0-9]+$/,
    'hexadecimal': /^[0-9A-F]+$/i,
    'hexcolor': /^#?([0-9A-F]{3}|[0-9A-F]{6})$/i,
    'base64': /^(?:[A-Z0-9+\/]{4})*(?:[A-Z0-9+\/]{2}==|[A-Z0-9+\/]{3}=|[A-Z0-9+\/]{4})$/i,
    'uuid': /^[0-9A-F]{8}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{12}$/i
};

class SchemaValidationError extends Error {
    constructor(errorsObj) {
        super();
        this.name = 'SchemaValidationError';
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
        return uniqueBy(errors, (obj) => {
            return obj.message && obj.field;
        }).map(error => {
            let key = error.field.split(/\.(.+)/)[1];
            let err = {};

            if (key) {
                err.key = key;
                err.message = error.message;
            } else {
                err.message = `${schemaName} data ${error.message}`;
            }

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

        if (validatedData && options.filterReadonly) {
            let readonlyProerties = traverse(schemaToValidate).reduce(function (memo, value) {
                if (this.key === 'readonly' && value === true) {
                    memo.push(this.parent.key);
                }
                return memo;
            }, []);

            traverse(data).forEach(function (value) {
                if (readonlyProerties.indexOf(this.key) !== -1) {
                    this.remove();
                }
            });
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
            return next(new SchemaValidationError(errorsObj));
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
