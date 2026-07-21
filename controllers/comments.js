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

const deleteComment = async (req, res)=>{
    const foundChallenge = await Challenge.findById(req.params.challengeId)

    const foundComment = foundChallenge.comments.id(req.params.commentId)

    if (foundChallenge && foundComment && foundComment.author.equals(req.session.user._id)){
        foundChallenge.comments.pull(foundComment)
    await foundChallenge.save()
    res.redirect(`/challenges/${req.params.challengeId}`)
    } else{
        res.send('Not found.')
    }

    
}

module.exports = 
{
    createComment,
    deleteComment
}