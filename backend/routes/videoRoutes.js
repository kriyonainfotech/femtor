const express = require('express');
const { initializeUpload, deleteVideoAndCleanup } = require('../controller/videoController');
const { handleS3Trigger, handleECSTrigger } = require('../controller/transcoderController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.post("/s3-trigger", handleS3Trigger);
router.post("/ecs-trigger", handleECSTrigger);

router.post("/initialize-upload", protect, initializeUpload);
router.delete("/delete-video/:videoId", deleteVideoAndCleanup)

module.exports = router;
