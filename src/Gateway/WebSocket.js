'use strict'

const WS = require('ws')
const { EventEmitter } = require('events')
const ZlibSync = require('zlib-sync')
const Endpoints = require('./Endpoints')
const Payloads = require('./Payloads')

module.exports = class WebSocket extends EventEmitter {
    constructor (client) {
        super()
        this._client = client
        this._ws = null
        this._seq = null
        this._token = null

        this.isReady = false
        this.isDisconnected = false

        this.lastHeartbeatSentAt = 0
        this.lastHeartbeatAckReceivedAt = 0
    }

    ping () {
        return this.lastHeartbeatAckReceivedAt - this.lastHeartbeatSentAt
    }

    /**
     * Connects the client to the Mercure Gateway
     * @param token
     */
    connect (token) {
        this._ws = new WS(Endpoints.GATEWAY)
        this._ws.once('open', () => {
            this._WSConnect(Payloads.IDENTIFY({ token }))
        })
        this._ws.once('close', this._handleWSClose.bind(this))
        this._ws.once('error', this._handleWSError.bind(this))
        this._ws.on('message', this._handleWSMessage.bind(this))
        this._token = token
    }

    /**
     * Disconnects the client from the Mercure Gateway
     */
    disconnect () {
        this.isDisconnected = true
        this._ws.terminate()
    }

    /**
     * Sends payload to the Mercure gateway
     * @param payload
     */
    WSSend (payload) {
        if (typeof payload === 'string') {
            payload = JSON.parse(payload)
        }
        this._ws.send(JSON.stringify(payload))
    }

    _WSConnect (payload) {
        if (this._ws !== null && this._ws.readyState !== this._ws.CLOSED) {
            this.WSSend(payload)
        }
    }

    _handleWSMessage (data, flags) {
        const message = this._decompressWSMessage(data, flags)
        switch (message.t) {
            case 'READY':
                if (!this.isReady) {
                    this.emit('ready')
                    this.isReady = true

                    setInterval(() => {
                        this._ws.send(JSON.stringify({t: "HEARTBEAT", token: this._token}))
                        this.lastHeartbeatSentAt = Date.now()
                    }, message.d)
                }
            break
            case 'ERROR':
                this.emit("error", require("../Constants").GATEWAY_ERRORS[message.c])
            break
            case 'PHOTO_CREATE':
                console.log("t")
                this.emit('photoCreate')
            break
            case 'HEARTBEAT':
                this.lastHeartbeatAckReceivedAt = Date.now()
            break
            case 'DISCONNECT':
                this.emit("disconnect")
            break
        }
    }

    _handleWSError (error) {
        if (this._ws !== null) {
            if (error) {
                throw error
            }
        }
    }

    _handleWSClose (code, data) {
        if (this._ws !== null && !this.isDisconnected) {
            setTimeout(() => this.connect(this._client.token), 1000)
        }
    }

    _decompressWSMessage (message, flags) {
        if (typeof flags !== 'object') { flags = {} }
        if (!flags.binary) {
            return JSON.parse(message)
        } else {
            const inflate = new ZlibSync.Inflate()
            inflate.push(message, ZlibSync.Z_SYNC_FLUSH)

            if (inflate.err < 0) {
                throw new Error('An error has occured with Zlib: ' + inflate.msg)
            }
            return JSON.parse(inflate.toString())
        }
    }
}
