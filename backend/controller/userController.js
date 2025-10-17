const User = require('../model/userModel');
const CoachProfile = require('../model/coachProfileModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// @route   POST /api/users
// @access  Public
exports.createUserByAdmin = async (req, res) => {
    try {
        const { name, email, role } = req.body;

        if (!name || !email || !role) {
            return res.status(400).json({ message: 'Please provide name, email, and role.' });
        }

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }

        const newUser = new User({
            name,
            email,
            role,
            createdBy: 'ADMIN' // Set how the user was created
        });

        const user = await newUser.save();

        // If the new user is a coach, create an empty coach profile
        if (user.role === 'COACH') {
            await CoachProfile.create({ userId: user._id, specialization: ['Not Specified'] });
        }

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
        });

    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

exports.createUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        // Check if user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const newUser = new User({ name, email, password, role });

        // If a file was uploaded, add its URL to the user document
        if (req.file) {
            newUser.profilePictureUrl = req.file.location; // .location is provided by multer-s3
        }

        const user = await newUser.save();

        // If the new user is a coach, create an empty coach profile
        if (user.role === 'COACH') {
            await CoachProfile.create({ userId: user._id, specialization: ['Not Specified'] });
        }

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            profilePictureUrl: user.profilePictureUrl,
        });

    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @route   GET /api/users
// @access  Private/Admin
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find({});
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private
exports.getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (user) {
            res.status(200).json(user);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Update user profile
// @route   PUT /api/users/:id
// @access  Private
exports.updateUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;
        // Add logic here if you allow role changes

        if (req.file) {
            user.profilePictureUrl = req.file.location;
        }

        const updatedUser = await user.save();
        res.status(200).json(updatedUser);

    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Delete a user
// @route   DELETE /api/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // If the user is a coach, also delete their coach profile
        if (user.role === 'COACH') {
            await CoachProfile.findOneAndDelete({ userId: user._id });
        }

        await User.findByIdAndDelete(req.params.id);

        res.status(200).json({ message: 'User removed successfully' });

    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Login user
// @route   POST /api/users/login
// @access  Public
exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log("Login attempt for email:", email, password);
        // Check for user
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            console.log("User not found for email:", email);
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(200).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            profilePictureUrl: user.profilePictureUrl,
            token,
        });
    } catch (error) {
        console.log("Login error:", error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

exports.registerUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        if (!name || !email || !password || !role) {
            return res.status(400).json({ message: 'Please provide name, email, password, and role.' });
        }

        const userExists = await User.findOne({ email }).select("+password");
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            role
        });

        if (req.file) {
            newUser.profilePictureUrl = req.file.location;
        }

        const user = await newUser.save();

        if (user.role === 'COACH') {
            await CoachProfile.create({ userId: user._id, specialization: ['Not Specified'] });
        }

        const token = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            profilePictureUrl: user.profilePictureUrl,
            token,
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};