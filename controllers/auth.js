const User = require('../models/user')
const bcrypt = require('bcrypt')

const showSignUpForm = (req, res) => {
    res.render('auth/sign-up.ejs')
}

const signUp = async (req, res) => {
    const userInDatabase = await User.findOne({
        username: req.body.username
    })

    if (userInDatabase) {
        return res.send('Username already taken.')
    }

    let userData = {}
    userData.username = req.body.username

    const hashedPassword = bcrypt.hashSync(req.body.password, 10)
    userData.password = hashedPassword

    const user = await User.create(userData)

    req.session.user = {
        username: user.username,
        _id: user._id
    }
    req.session.save(() => {
        res.redirect('/')
    })
}

const showSignInForm = (req, res) => {
    res.render('auth/sign-in.ejs')
}

const signIn = async (req, res) => {
    const userInDatabase = await User.findOne({
        username: req.body.username
    })

    if (!userInDatabase) {
        return res.send('User does not exist.')
    }

    const validPassword = bcrypt.compareSync(req.body.password, userInDatabase.password)

    if(!validPassword) {
        return res.send('Login failed. Please try again.')
    }

    req.session.user = {
        username: userInDatabase.username,
        _id: userInDatabase._id
    }
    req.session.save(() => {
        res.redirect('/')
    })
}

const signOut = async (req, res) => {
    req.session.destroy(() => {
        res.redirect('/')
    })
}

module.exports = {
    showSignUpForm,
    signUp,
    showSignInForm,
    signIn,
    signOut,
}