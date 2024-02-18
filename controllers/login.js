const bcrypt = require('bcrypt')
const loginRouter = require('express').Router()
const jwt = require('jsonwebtoken')
const User = require('../models/user')

loginRouter.post('/', async (request, response) => {
    const body = request.body
    const user = await User.findOne({email: body.email})
    const passwordCorrect = user === undefined ? false : await bcrypt.compare(body.password, user.passwordHash)
    if(!( user && passwordCorrect)){
        response.status(400).json({error: "invalid username or password"})
    }
    const userForToken = {
        email: user.email,
        id: user._id
    }
    const token = jwt.sign(userForToken, process.env.SECRET)
    console.log(token)
    response.status(200).json({token, email: user.email, id: user.id })
})

module.exports = loginRouter