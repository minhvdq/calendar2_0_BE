const userRouter = require('express').Router()
const User = require('../models/user')
const bcrypt = require('bcrypt')
const mongoose = require('mongoose')
const sendEmail = require('../utils/email/sendEmail')

userRouter.get('/', async (request, response) => {
    console.log("getting")
    const users = await User.find({})
    console.log(users)
    response.status(200).json(users)
})

userRouter.get('/:id', async (request, response) => {
    const user = await User.findById(request.params.id)
    response.status(200).json(user)
})

userRouter.post('/', async (request, response) => {
    const body = request.body
    let user = await User.findOne({email: body.email})
    if( user ){
        console.log(user)
        throw new Error( "User already existed" )
    }
    const salt = 10
    const passwordHash = await bcrypt.hash(body.password, salt)

    const newUser = new User({
        email: body.email,
        passwordHash: passwordHash,
        events: [],
    })

    const savedUser = await newUser.save()

    sendEmail(savedUser.email,"Welcome to Calenda2_0",{name: savedUser.email.split()[0]},"./template/welcome.handlebars")
    response.status(201).json(savedUser)
})

userRouter.delete('/:id', async(request, response) => {
    const userId = request.params.id
    const user = await User.findById(userId)
    await User.findByIdAndDelete(userId)
    response.status(204).json(user)
})

userRouter.put('/:id', async( request, response) => {
    const userId = request.params.id
    const body = request.body
    const currentUser = await User.findById(userId)
    const salt = 10
    const newPasswordHash = body.password ? await bcrypt.hash(body.password, salt) : null
    const fixingUser = {
        email: body.email ? body.email : currentUser.email,
        passwordHash : body.password ? newPasswordHash : currentUser.passwordHash,
        events: body.events ? body.events : currentUser.events
    }
    const updateUser = await User.findByIdAndUpdate(userId, fixingUser, {new: true})

    response.json(updateUser)
})

module.exports = userRouter