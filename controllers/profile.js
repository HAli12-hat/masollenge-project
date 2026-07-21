const User = require('../models/user')
const Challenge = require('../models/challenge')

const showProfile = async (req, res)=>{
    const currentUser =  await User.findById(req.session.user._id)

    const userChallenges = await Challenge.find({owner: currentUser._id})

    const challengesWithUserComments = await Challenge.find({'comments.author': currentUser._id})

    const userComments = []
    challengesWithUserComments.forEach(function(challenge){
        challenge.comments.forEach(function(comment){
            if(comment.author && comment.author.equals(currentUser._id)){
                userComments.push({comment: comment, challenge: challenge})
            }
        })
    })

    res.render('profile.ejs', {currentUser, userChallenges, userComments})
}

module.exports = 
{
    showProfile
}