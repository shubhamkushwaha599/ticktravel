const mongoose = require('mongoose');
const SERVER_CONFIG = require('./server-config');

const createDbConnection = () => {
    const dbUri = (SERVER_CONFIG.MONGO_URI) ? SERVER_CONFIG.MONGO_URI : "mongodb://localhost:27017/" + SERVER_CONFIG.DATABASE;

    mongoose.connect(dbUri, {})
    .then(() => {
        console.log("✅ MongoDB connection established");
    })
    .catch((error) => {
        console.error("❌ MongoDB connection error:", error);
    });
};

module.exports = {
    createDbConnection
};
