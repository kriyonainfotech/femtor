const CoachProfile = require('../model/coachProfileModel');
const User = require('../model/userModel');

exports.createFullCoach = async (req, res) => {
    try {
        console.log("🔥 createFullCoach route hit!", req.body);

        const { userId, bio, categories, isBestseller, introVideoUrl, socialMediaLinks } = req.body;

        // Basic validation
        if (!userId || !categories) {
            return res.status(400).json({ message: "Please provide userId and at least one category." });
        }

        // 1️⃣ Check if user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        // 2️⃣ Check if user is already a coach
        const existingCoach = await CoachProfile.findOne({ userId });
        if (existingCoach) {
            return res.status(400).json({ message: "This user is already assigned as a coach." });
        }

        // 3️⃣ Update the user role to COACH (if not already)
        if (user.role !== "COACH") {
            user.role = "COACH";
            await user.save();
        }

        // 4️⃣ Counting logic for `index`
        const count = await CoachProfile.countDocuments();
        const newIndex = count; // 0-based index

        // 5️⃣ Create the Coach Profile linked to the existing user
        const newCoachProfile = new CoachProfile({
            userId,
            bio,
            categories: Array.isArray(categories)
                ? categories
                : categories.split(",").map((c) => c.trim()),
            isBestseller,
            introVideoUrl,
            socialMediaLinks,
            index: newIndex,
        });

        await newCoachProfile.save();
        console.log("✅ Coach profile created:", newCoachProfile);
        res.status(201).json({
            message: "Coach profile created successfully",
            user,
            profile: newCoachProfile,
        });
    } catch (error) {
        console.error("❌ Error in createFullCoach:", error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// @desc    Get all coach profiles (populated with user data)
// @route   GET /api/coaches
// @access  Private/Admin
exports.getAllCoachProfiles = async (req, res) => {
    try {
        const coachProfiles = await CoachProfile.find({})
            .populate('userId', 'name email') // Fetch name & email
            .sort({ index: 1 }); // Sort by index
        res.status(200).json(coachProfiles);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};
// @desc    Get a single coach profile by its own ID
// @route   GET /api/coaches/:id
// @access  Private/Admin
exports.getCoachProfileById = async (req, res) => {
    try {
        const profile = await CoachProfile.findById(req.params.id).populate('userId', 'name email');
        if (!profile) {
            return res.status(404).json({ message: 'Coach profile not found' });
        }
        res.status(200).json(profile);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Update a coach profile
// @route   PUT /api/coaches/:id
// @access  Private/Admin
exports.updateCoachProfile = async (req, res) => {
    try {
        const profile = await CoachProfile.findById(req.params.id);
        if (!profile) {
            return res.status(404).json({ message: 'Coach profile not found' });
        }

        // Update all fields from the request body
        // This is flexible enough to handle partial or full updates
        Object.assign(profile, req.body);

        const updatedProfile = await profile.save();
        res.status(200).json(updatedProfile);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

exports.reorderCoach = async (req, res) => {
    try {
        const { id } = req.params;
        const { direction } = req.body; // "up" or "down"

        // Fetch all coaches with index and populate user info
        const coaches = await CoachProfile.find().sort({ index: 1 }).populate('userId', 'name email');
        const currentIndex = coaches.findIndex(c => c._id.toString() === id);

        if (currentIndex === -1) return res.status(404).json({ message: 'Coach not found' });

        if ((direction === 'up' && currentIndex === 0) ||
            (direction === 'down' && currentIndex === coaches.length - 1)) {
            return res.status(400).json({ message: 'Cannot move further' });
        }

        const swapIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

        // Swap the indexes
        const temp = coaches[currentIndex].index;
        coaches[currentIndex].index = coaches[swapIndex].index;
        coaches[swapIndex].index = temp;

        await coaches[currentIndex].save();
        await coaches[swapIndex].save();

        // Fetch again to return updated list with user info
        const updatedCoaches = await CoachProfile.find()
            .populate('userId', 'name email')
            .sort({ index: 1 });

        res.status(200).json({
            message: `Moved coach ${direction}`,
            coaches: updatedCoaches
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Delete a coach profile
// @route   DELETE /api/coaches/:id
// @access  Private/Admin
exports.deleteCoachProfile = async (req, res) => {
    try {
        const coach = await CoachProfile.findByIdAndDelete(req.params.id);
        if (!coach) {
            return res.status(404).json({ message: 'Coach not found' });
        }
        res.status(200).json({ message: 'Coach profile deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

exports.getAllCoaches = async (req, res) => {
    try {
        // Find all users with role 'COACH'
        const coaches = await User.find({ role: 'COACH' }).select('name email');

        // For each coach, fetch their profile
        const coachesWithProfiles = await Promise.all(coaches.map(async coach => {
            const profile = await CoachProfile.findOne({ userId: coach._id });
            return {
                user: coach,
                profile
            };
        }));

        res.status(200).json({
            message: 'Coaches fetched successfully',
            coaches: coachesWithProfiles
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};