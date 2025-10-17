const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a name'],
        trim: true,
    },
    email: {
        type: String,
        required: [true, 'Please provide an email'],
        unique: true,
        lowercase: true,
        trim: true,
    },
    // Password is no longer required, to allow for social-only logins
    // and admin-created accounts.
    password: {
        type: String,
        minlength: 8,
        // select: false, // Do not send password in query results
    },
    role: {
        type: String,
        enum: ['USER', 'COACH', 'ADMIN'],
        default: 'USER',
    },
    profilePictureUrl: {
        type: String,
        default: 'https://placehold.co/400x400/222/FFF?text=User',
    },
    // --- NEW FIELDS ---
    googleId: {
        type: String,
    },
    appleId: {
        type: String,
    },
    access: {
        type: Boolean,
        default: false,
    },
    createdBy: {
        type: String,
        enum: ['SELF', 'ADMIN'],
        default: 'SELF',
    }
}, {
    timestamps: true,
});

// Hash password before saving, ONLY if it exists and was modified.
// This hook now correctly handles users without passwords.
// userSchema.pre('save', async function (next) {
//     if (!this.isModified('password')) return next();
//     this.password = await bcrypt.hash(this.password, 12);
//     next();
// });

// // Method to compare candidate password with the user's actual password
// userSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
//     return await bcrypt.compare(candidatePassword, userPassword);
// };

const User = mongoose.model('User', userSchema);

module.exports = User;
