'use strict'

const Constants = require('../Constants');

module.exports.BASE_URL = 'http://localhost/api/v' + Constants.API_VERSION;
module.exports.CDN_URL = 'http://localhost/cdn';
module.exports.GATEWAY = 'ws://localhost:90'
module.exports.USER = (userId) => `/users/${userId}`
module.exports.PHOTOS = (photoID) => `/photos/${photoID}`
module.exports.POST_PHOTO = "/photos"