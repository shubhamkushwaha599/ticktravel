require('dotenv').config(); // Make sure to load .env file

const SERVER_CONFIG = {
    SECURE: false,
    DATABASE: 'ticktravel_db',
    WEBROOT: '',
    PORT: 80,
    ADMIN_KEY: '',
    ADMIN_EMAILS: [],
    ADMIN_CREDS : []
};

module.exports = Object.freeze(SERVER_CONFIG);
