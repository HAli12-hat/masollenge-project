const User = require('../models/user')
const Challenge = require('../models/challenge')

const showProfile = async (req, res)=>{
  const currentUser =  await User.findById(req.session.user._id)
    const userChallenges = await Challenge.find({owner: currentUser._id})

    res.render('profile.ejs', {currentUser, userChallenges})
}

module.exports = 
{
    showProfile
}