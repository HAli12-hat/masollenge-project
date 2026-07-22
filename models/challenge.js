const mongoose = require('mongoose')
const commentSchema = new mongoose.Schema({
    author: 
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    content:
    {
        type: String,
        required: true
    }
},{timestamps: true})

const challengeSchema = new mongoose.Schema({
    title:
    {
        type: String,
        required: true
    },

    game:
    {
        type: String,
        required: true,
        
    },

    genre:
    {
        type: String,
        enum: ['action', 'hack-and-slash', 'soulsborne', 'platformer', 'beat-em-up' ],
        required: true
    },

    rules:
    {
        type: String,
        required: true
    },

    owner:
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    videoUrl:
    {
        type: String,
        required: true
    },

    platform:
    {
        type: String,
        enum: ['pc', 'switch', 'ps5', 'xbox'],
        required: true
    },

    comments: [commentSchema],
    favoritedByUsers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],


},{timestamps: true})

const Challenge = mongoose.model('Challenge', challengeSchema)

module.exports = Challenge