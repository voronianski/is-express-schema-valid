# is-express-schema-valid

[![build status](http://img.shields.io/travis/voronianski/is-express-schema-valid.svg?style=flat)](https://travis-ci.org/voronianski/is-express-schema-valid.js)
[![npm version](http://badge.fury.io/js/is-express-schema-valid.svg)](http://badge.fury.io/js/is-express-schema-valid)
[![Dependency Status](http://david-dm.org/voronianski/is-express-schema-valid.svg)](http://david-dm.org/voronianski/is-express-schema-valid)

> Middleware to validate json schema of `req.body`, `req.params` and `req.query`. It is based on [JSONSchema](http://json-schema.org) spec and [is-my-json-valid](https://github.com/mafintosh/is-my-json-valid) that uses code generation to be extremely fast.

## Install

```bash
npm install is-express-schema-valid --save
```

## Usage

### `isExpressSchemaValid({ payload, query, params })`

Create schema validation middleware using the specified keys for each type of request data:

- `req.body` validated by `payload` schema object
- `req.params` validated by `params` schema object
- `req.query` validated by `query` schema object

### Example

```javascript
import express from 'express';
import bodyParser from 'body-parser';
import validate from 'is-express-schema-valid';

const app = express();

const loginSchema = {
    payload: {
        email: {
            type: 'string',
            required: true,
            format: 'email'
        },
        password: {
            type: 'string',
            required: true,
            minLength: 1
        }
    }
};

app.use(bodyParser.json());
app.post('/login',
    validate(loginSchema),
    findAndLoginUser
);
app.use(handleErrors);

function findAndLoginUser (req, res, next) {
    // if schema validation fails 
    // this middleware won't be called
}

function handleErrors (err, req, res, next) {
    // validation error will be passed as first argument
    // you can return it or match with your api responses
}

app.listen(3000);
```

### Define schemas

When defining a schema for request's payload / params / query you are able to pass a plain object. In this case `is-express-schema-valid` will automagically populate your schema with default `object` properties:

```javascript
const schema = {
    payload: {
        foo: {
            type: 'string',
            required: true
        }
    }
};

// will be passed to validator as:
// { 
//   type: 'object', 
//   required: true, 
//   additionalProperties: false, 
//   properties: { 
//     foo: { 
//       type: 'string', 
//       required: true 
//     }
//   }
// }
```

In other cases when you need a different `type` use a full schema. For example, when payload needs to be an `array`:

```javascript
const schema = {
    payload: {
        type: 'array',
        uniqueItems: true,
        items: {
            type: 'number'
        }
    }
};

// it will be used as is by validator
```

### Formats

##### `"mongo-object-id"`

##### `"alpha"`

##### `"alphanumeric"`

##### `"numeric"`

##### `"hexadecimal"`

##### `"hexcolor"`

##### `"base64"`

Just a reminder that there are default formats supported by JSONSchema:

- `"date-time"` - date representation, as defined by RFC 3339, section 5.6.
- `"email"` - internet email address, see RFC 5322, section 3.4.1.
- `"hostname"` - internet host name, see RFC 1034, section 3.1.
- `"ipv4"` - IPv4 address, according to dotted-quad ABNF syntax as defined in RFC 2673, section 3.2.
- `"ipv6"` - IPv6 address, as defined in RFC 2373, section 2.2.
- `"uri"` - a universal resource identifier (URI), according to RFC3986.

### Errors

If provided data doesn't match provided schema _is-express-schema-valid_ middleware passes instance of `SchemaValidationError` class down to your app's error handler middleware:

```javascript
import { SchemaValidationError } from 'is-express-schema-valid';

function errorHandlerMiddleware (err, req, res, next) {
    // handle schema validation error
    if (err instanceof SchemaValidationError) {
        // check lists of errors for each schema
        console.log(err.errors);
        // { payload: [...], query: [...], params: [...] }
    }
}
```

## JSONSchema

In order to get comfortable with [JSONSchema spec](http://json-schema.org) and its' features I advice you to check the book ["Understanding JSON Schema"](http://spacetelescope.github.io/understanding-json-schema) (also [PDF](http://spacetelescope.github.io/understanding-json-schema/UnderstandingJSONSchema.pdf) version) or look at [examples](http://json-schema.org/examples.html).

---

**MIT Licensed**
