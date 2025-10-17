const express = require('express');
const router = express.Router();
const {
    getAllCoachProfiles,
    getCoachProfileById,
    updateCoachProfile,
    createFullCoach,
    reorderCoach,
    deleteCoachProfile,
} = require('../controller/coachController');
// const { protect, admin } = require('../middleware/authMiddleware'); // Assuming you have this

// All routes are protected and for admins only
// router.use(protect, admin);

console.log("✅ coachRoutes loaded");
console.log("🔥 create-coach route hit!");
router.post("/create-coach", createFullCoach);

router.get('/getCoachProfiles', getAllCoachProfiles);
router.put('/updateCoachProfile/:id', updateCoachProfile)
router.put('/:id/order', reorderCoach);
router.delete("/delete-coach/:id", deleteCoachProfile);
router.get("/get-all-coaches", getAllCoachProfiles)

module.exports = router;
