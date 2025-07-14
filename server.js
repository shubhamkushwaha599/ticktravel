const fs = require("fs");
const http = require("http");
const https = require("https");
const path = require("path");

const { PORT } = require('./src/config/server-config');
const app = require('./src/app');

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});

