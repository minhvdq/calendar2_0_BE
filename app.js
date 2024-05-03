//const express = require('express')
const express = require('express')
require('express-async-errors')
const app = express()
const cors = require('cors')
const userRouter = require('./controllers/user')
const loginRouter = require('./controllers/login')
const eventRouter = require('./controllers/event')
const authRouter = require('./controllers/auth.route')
const logger = require('./utils/logger')
const config = require('./utils/config')
const middlewares = require('./utils/middlewares')
const mongoose = require('mongoose')
const path = require('path');

mongoose.set('strictQuery', false)

logger.infor(`connecting to MongoDB`)

mongoose.connect(config.MONGODB_URI).then(result => {
    logger.infor(`connected to MongoDB`,config.MONGODB_URI)
}).catch(error => logger.infor(error.message))

app.use(cors())
app.use(express.json())
app.use('/PasswordReset', (req, res) => {
    res.sendFile(path.join(__dirname,'/ui_assets/index.html'))
} )

app.use('/PasswordResetRequest', (req, res) => {
    res.sendFile(path.join(__dirname,'/ui_assets/request.html'))
} )
app.use(middlewares.requestLogger)
app.use(middlewares.tokenExtractor)
app.use('/api/users', userRouter)
app.use('/api/login', loginRouter)
app.use('/api/events', eventRouter)
app.use('/api/auth', authRouter)
app.use(middlewares.unknownEndpoint)
app.use(middlewares.errorHandler)

module.exports = app