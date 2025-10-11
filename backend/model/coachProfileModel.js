const mongoose = require('mongoose');

const coachProfileSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Links this profile to the main User model
        required: true,
        unique: true,
    },
    bio: {
        type: String,
        trim: true,
        maxlength: 500,
    },
    categories: {
        type: [String],
        required: [true, "A coach must have at least one category (e.g., 'Nail Art')."],
    },
    index: {
        type: Number,
        required: true,
        default: 0
    },
    isBestseller: {
        type: Boolean,
        default: false,
    },
    introVideoUrl: {
        type: String,
    },
    tutorials: [{
        title: { type: String, required: true },
        videoUrl: { type: String, required: true },
        description: { type: String, maxlength: 300 },
    }],
    socialMediaLinks: {
        instagram: { url: String, isVerified: { type: Boolean, default: false } },
        facebook: { url: String, isVerified: { type: Boolean, default: false } },
        youtube: { url: String, isVerified: { type: Boolean, default: false } },
        website: { url: String, isVerified: { type: Boolean, default: false } },
    },
}, {
    timestamps: true,
});

const CoachProfile = mongoose.model('CoachProfile', coachProfileSchema);

module.exports = CoachProfile;
