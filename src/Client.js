'use strict'

const Endpoints = require('./Gateway/Endpoints')
const WebSocket = require('./Gateway/WebSocket')
const APIRequest = require('./Rest/APIRequest')
const { readFile } = require("fs")

const { EventEmitter } = require('events')

module.exports = class Client extends EventEmitter {
    /**
     * The Client class
     * @param token
     */
    constructor (token = null) {
        super()
        this.token = token
        this.ws = new WebSocket(this)
        this._APIRequest = null
        /* Declare client events */
        this.ws.on('ready', () => {
            this.emit('ready')
        })
        this.user = null
    }

    /**
     * Connects the client to Mercure
     * @param token
     */
    async login (token) {
        this.token = token || this.token
        this._APIRequest = new APIRequest(token || this.token)
        this.ws.connect(this.token)
        const u = await this.getUser("@me")
        this.user = u
    }

    ping () {
        return this.ws.ping()
    }

    /**
     * Disconnects the client from Mercure
     */
    logout () {
        this.ws.disconnect()
    }

    /**
     * Get a specified user
     * @param {String} userId
     * @returns {Promise<Object>} Returns a promise object of a specified user
     */
    getUser (userId) {
        return this._APIRequest.make('get', Endpoints.USER(userId))
    }

    /**
     * Get a specified photo
     * @param {String} photoID 
     * @returns {Object} Returns an object of a specified photo
     */
    async getPhoto (photoID) {
        const photo = await this._APIRequest.make('get', Endpoints.PHOTOS(photoID))
        const end = photo.image.startsWith("a_") ? 'gif' : photo.image.startsWith("v_") ? 'mp4' : photo.image.startsWith("s_") ? 'mp3' : 'png'
        return {
            id: photo.id,
            image: Endpoints.CDN_URL+'/photos/'+photo.image+'.'+end,
            author_id: photo.author_id,
            like: photo.like,
            deleted: photo.deleted,
            messages: photo.messages,
            topic: photo.topic,
            location: photo.location,
            stats: photo.stats
        }
    }

    /**
     * @param {String} topic Description of the post
     * @param {Path} src The source for getting it with FS
     * @returns {Promise<PhotoID>} Return a promise with the ID
     */
    postPhoto (topic, src) {
        const validMimeType = [ "png", "jpg", "gif", "mp3", "mp4" ];
        if(!validMimeType.includes(src.split(".").pop())) return console.error(`Only "${validMimeType.join(", ")}" are allowed`)

        const req = this._APIRequest;
        readFile(src, {encoding: "base64"}, function (err, data) {
            if(err) return console.error(`Path not found (${src})`)
            
            req.make('post', Endpoints.POST_PHOTO, {
                body: {
                    topic,
                    image: `data:${[ "png", "jpg", "gif" ].includes(src.split(".").pop()) ? `image/${src.split(".").pop() === "jpg" ? "png" : src.split(".").pop()}` : src.split(".").pop() === "mp3" ? "audio/mp3" : "video/mp4"};base64,${data}`
                }
            }).then(t => console.log(t))
            .catch(e => console.log(e))
        })
    }
}