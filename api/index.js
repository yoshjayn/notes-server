// import serverless from 'serverless-http'
// import app from '../server.js'

// export default serverless(app)

const express = require('express');
const app = require('../server');

module.exports = app;