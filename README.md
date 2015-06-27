# is-express-schema-valid

> Endpoints schema validator of body, params and query middleware based on [JSONSchema](http://json-schema.org) and [is-my-json-valid](https://github.com/mafintosh/is-my-json-valid) module "that uses code generation to be extremely fast".

```bash
npm install is-express-schema-valid --save
```

## Example

```javascript
import express from 'express';
import validate from 'is-express-schema-valid';

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
}

app.post('/login',
    validate(loginSchema),
    findAndLoginUser
);
app.use(handleErrors);

function findAndLoginUser (req, res, next) {
    // if schema validation falis 
    // this middleware wont be called
}

function handleErrors (err, req, res, next) {
    // validation error will passed as first argument
    // return it or match with your api responses
}

app.listen(3000);
```

## Built-in formats

---

**MIT Licensed**
