const Challenge = require('../models/challenge')

const index = async (req, res)=>{
    const allChallenges = await Challenge.find().populate('owner')
    res.render('challenges/index.ejs', {allChallenges})
}

const showNewForm = (req, res)=>{
    res.render('challenges/new.ejs')
}

const convertToEmbedUrl = (videoUrl) => {
    try {
        const url = new URL(videoUrl)
        let videoId

        if (url.hostname === 'youtu.be') {
            videoId = url.pathname.slice(1)
        }

        if (
            url.hostname === 'youtube.com' ||
            url.hostname === 'www.youtube.com'
        ) {
            if (url.pathname === '/watch') {
                videoId = url.searchParams.get('v')
            }

            if (url.pathname.startsWith('/embed/')) {
                videoId = url.pathname.split('/')[2]
            }

            if (url.pathname.startsWith('/shorts/')) {
                videoId = url.pathname.split('/')[2]
            }
        }

        if (!videoId) {
            return null
        }

        return `https://www.youtube.com/embed/${videoId}`
    } catch {
        return null
    }
}

const createChallenge = async (req, res)=>{
     const embedUrl = convertToEmbedUrl(req.body.videoUrl)

    if (!embedUrl) {
        return res.send('Please enter a valid YouTube URL.')
    }

    const recordData = 
    {
        title: req.body.title,
        game: req.body.game,
        genre: req.body.genre,
        rules: req.body.rules,
        owner: req.session.user._id,
        videoUrl: embedUrl,
        platform: req.body.platform
    }

    await Challenge.create(recordData)
    res.redirect('/challenges')
}

const showChallenge = async (req, res)=>{
    const foundChallenge = await Challenge.findById(req.params.challengeId).populate('owner').populate('comments.author')

    res.render('challenges/show.ejs', {foundChallenge})
}

const deleteChallenge = async (req, res)=>{
    await Challenge.findByIdAndDelete(req.params.challengeId)
    res.redirect('/challenges')
}

const showEdit = async (req, res)=>{
    const foundChallenge = await Challenge.findById(req.params.challengeId).populate('owner')
    res.render('challenges/edit.ejs', {foundChallenge})
}

module.exports = 
{
    index,
    showNewForm,
    createChallenge,
    showChallenge,
    deleteChallenge,
    showEdit
}