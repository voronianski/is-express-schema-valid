export const payloadObjSchema = {
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

export const payloadObjSchemaWithReadonly = {
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
        },
        secret: {
            type: 'string',
            readonly: true
        }
    }
};

export const payloadNestedObjSchema = {
    payload: {
        name: {
            type: 'string',
            required: true
        },
        count: {
            type: 'object',
            properties: {
                bar: {
                    type: 'number'
                }
            }
        },
        list: {
            type: 'array',
            items: {
                type: 'string'
            }
        }
    }
};

export const payloadArrSchema = {
    payload: {
        type: 'array',
        uniqueItems: true,
        items: {
            type: 'number'
        }
    }
};

export const mixedSchema = {
    payload: {
        checked: {
            type: 'boolean'
        }
    },
    query: {
        num: {
            type: 'number'
        }
    }
};

export const paramsSchema = {
    params: {
        id: {
            type: 'string',
            format: 'mongo-object-id'
        }
    }
};
