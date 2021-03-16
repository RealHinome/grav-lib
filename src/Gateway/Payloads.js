'use strict'

const Constants = require('../Constants')
const MODULE_NAME = require('../../package').name

module.exports.IDENTIFY = (data) => {
    return {
        token: data.token || null,
        properties: {
            $os: require('os').platform(),
            $browser: MODULE_NAME,
            $device: MODULE_NAME
        },
        t: "CONNECT"
    }
}