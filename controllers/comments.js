const Challenge = require('../models/challenge')

const createComment = async (req, res)=>{
    const foundChallenge = await Challenge.findById(req.params.challengeId)
    const commentData = 
    {
        content: req.body.content,
        author: req.session.user._id
    }

    foundChallenge.comments.push(commentData)
    await foundChallenge.save()
    res.redirect(`/challenges/${req.params.challengeId}`)
}

module.exports = 
{
    createComment
}