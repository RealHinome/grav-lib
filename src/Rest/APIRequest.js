'use strict'

const fetch = require('node-fetch')
const Endpoints = require('../Gateway/Endpoints')

module.exports = class APIRequest {
    constructor (token) {
        this._token = token
    }

    async make (method, endpoint, options = { body: null }) {
        return new Promise((resolve, reject) => {
            fetch(Endpoints.BASE_URL+endpoint, {
                method,
                body: options.body ? typeof options.body === 'string' ? options.body : JSON.stringify(options.body) : null,
                headers: {
                    'Content-Type': 'application/json',
                    authorization: this._token
                }
            }).catch(e => reject)
            .then(res => res.json())
            .then(res => resolve(res))
        })
    }
}
