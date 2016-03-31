# is-express-schema-valid

[![build status](http://img.shields.io/travis/voronianski/is-express-schema-valid.svg?style=flat)](https://travis-ci.org/voronianski/is-express-schema-valid)
[![npm version](http://badge.fury.io/js/is-express-schema-valid.svg)](http://badge.fury.io/js/is-express-schema-valid)
[![Dependency Status](http://david-dm.org/voronianski/is-express-schema-valid.svg)](http://david-dm.org/voronianski/is-express-schema-valid)
[![Download Count](http://img.shields.io/npm/dm/is-express-schema-valid.svg?style=flat)](http://www.npmjs.com/package/is-express-schema-valid)

> Middleware to validate json schema of `req.body`, `req.params` and `req.query`. It is based on [JSONSchema](http://json-schema.org) spec and [is-my-schema-valid](https://github.com/voronianski/is-my-schema-valid) module.

## Install

```bash
npm install is-express-schema-valid --save
```

## Usage

### `isExpressSchemaValid({ payload, query, params }, options)`

Create schema validation middleware using the specified keys for each type of request data:

- `payload` schema object validates `req.body`
- `params` schema object validates `req.params` 
- `query` schema object validates `req.query`

### Options

- `filter` - filter away fields that are not in the schema, defaults to `false`
- `filterReadonly` - filter away fields that are marked as `readonly: true` in schema, defaults to `false`

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

There are several additional formats added for easy validating the requests:

- `"mongo-object-id"` - check if the string is a valid hex-encoded representation of a [MongoDB ObjectId](http://docs.mongodb.org/manual/reference/object-id/)
- `"alpha"` - check if the string contains only letters (a-zA-Z)
- `"alphanumeric"` - check if the string contains only letters and numbers
- `"numeric"` - check if the string contains only numbers
- `"hexadecimal"` - check if the string is a hexadecimal number
- `"hexcolor"` - check if the string is a hexadecimal color
- `"base64"` - check if a string is [Base64](https://en.wikipedia.org/wiki/Base64) encoded
- `"decimal"` - check if a string is a decimal number, such as 0.1, .3, 1.1, 1.00003, 4.0, etc.
- `"int"` - check if a string is an integer
- `"float"` - check if a string is a float
- `"uuid"` - check if the string is [UUID](https://en.wikipedia.org/wiki/Universally_unique_identifier)

In the example below we can ensure that id passed as param is valid [MongoDB ObjectId](http://docs.mongodb.org/manual/reference/object-id/): 

```javascript
import validate from 'is-express-schema-valid';

const schema = {
    params: {
        id: {
            type: 'string',
            format: 'mongo-object-id'
        }
    }
};

app.get('/items/:id',
    validate(schema) 
    //...
);
```

Just a reminder that there are default **built-in formats** supported by JSONSchema:

- `"date-time"` - date representation, as defined by [RFC 3339, section 5.6](http://tools.ietf.org/html/rfc3339).
- `"email"` - internet email address, see [RFC 5322, section 3.4.1](http://tools.ietf.org/html/rfc5322).
- `"hostname"` - internet host name, see [RFC 1034, section 3.1](http://tools.ietf.org/html/rfc1034).
- `"ipv4"` - IPv4 address, according to dotted-quad ABNF syntax as defined in [RFC 2673, section 3.2](http://tools.ietf.org/html/rfc2673).
- `"ipv6"` - IPv6 address, as defined in [RFC 2373, section 2.2](http://tools.ietf.org/html/rfc2373).
- `"uri"` - a universal resource identifier (URI), according to [RFC3986](http://tools.ietf.org/html/rfc3986).

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
