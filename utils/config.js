require('dotenv').config()

const MONGODB_URI = process.env.MONGODB_URI
const PORT = process.env.PORT
const ORACLE_PASS = process.env.ORACLE_PASSWORD

module.exports = { MONGODB_URI, PORT, ORACLE_PASS }