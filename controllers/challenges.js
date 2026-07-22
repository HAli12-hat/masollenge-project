const Challenge = require('../models/challenge')

const index = async (req, res)=>{
    const allChallenges = await Challenge.find().populate('owner')
    res.render('challenges/index.ejs', {allChallenges})
}

const showNewForm = async (req, res) => {
    const searchTerm = req.query.search || ''

    let games = []
    let apiError = null

    if (searchTerm) {
        try {
            const apiUrl =
                `https://api.rawg.io/api/games` +
                `?key=${process.env.RAWG_API}` +
                `&search=${encodeURIComponent(searchTerm)}` +
                `&search_precise=true` +
                `&page_size=10`

            const response = await fetch(apiUrl)

            if (!response.ok) {
                throw new Error(
                    `RAWG request failed with status ${response.status}`
                )
            }

            const data = await response.json()

            games = data.results
        } catch (error) {
            console.log('RAWG API error:', error.message)

            apiError = 'Games could not be loaded. Please try again.'
        }
    }

    res.render('challenges/new.ejs', {
        games,
        searchTerm,
        apiError
    })
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

    const userHasFavorited = foundChallenge.favoritedByUsers.some((user) => {
        return user.equals(req.session.user._id)
    })

    res.render('challenges/show.ejs', {foundChallenge, userHasFavorited})
}

const deleteChallenge = async (req, res)=>{
    const foundChallenge = await Challenge.findById(req.params.challengeId)

    if (!foundChallenge){
        return res.send('Record Does Not Exist.')
    }

    const isOwner = foundChallenge.owner.equals(req.session.user._id)

    if (!isOwner){
        return res.send('You do not have permission for this action.')
    }

    await Challenge.findByIdAndDelete(req.params.challengeId)
    res.redirect('/challenges')
}

const showEdit = async (req, res)=>{
    const foundChallenge = await Challenge.findById(req.params.challengeId)

    res.render('challenges/edit.ejs', {foundChallenge})
}

const updateChallenge = async (req, res)=>{
    const foundChallenge = await Challenge.findById(req.params.challengeId)

    if (!foundChallenge){
        return res.send('Record Does Not Exist.')
    }

    const isOwner = foundChallenge.owner.equals(req.session.user._id)

    if (!isOwner){
        return res.send('You do not have permission for this action.')
    }

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
        videoUrl: embedUrl,
        platform: req.body.platform
    }

    await Challenge.findByIdAndUpdate(req.params.challengeId, recordData)
    res.redirect(`/challenges/${req.params.challengeId}`)
}

const favorite = async (req, res)=>{
    await Challenge.findByIdAndUpdate(req.params.challengeId, {$addToSet:{favoritedByUsers:req.session.user._id}})

    res.redirect(`/challenges/${req.params.challengeId}`)
}

const unfavorite = async (req, res)=>{
    await Challenge.findByIdAndUpdate(req.params.challengeId, {$pull:{favoritedByUsers:req.session.user._id}})

    res.redirect(`/challenges/${req.params.challengeId}`)
}

module.exports = 
{
    index,
    showNewForm,
    createChallenge,
    showChallenge,
    deleteChallenge,
    showEdit,
    updateChallenge,
    favorite,
    unfavorite
}