const { WebSocket } = require("ws");
const Video = require("../model/videoModel");
const { deleteAllKeys } = require("../redis/redis");
const { userConnections } = require("../server");
const { generateUrlToPutObject } = require("../utils/s3-signed-url");
const catchAsync = require("../utils/catch-async");
const AppError = require("../utils/app-error");
const Lesson = require("../model/lessonModel")

const VIDEO_PROCESS_STATES = {
    INITIALIZING: "initializing",
    UPLOADING: "uploading",
    PROCESSING: "processing",
    COMPLETED: "completed",
    FAILED: "failed",
};

// exports.uploadVideo = catchAsync(async (req, res, next) => {
//     const { fileName, contentType, title, description } = req.body;
//     const user = req.user;

//     if (!fileName || !contentType || !title) {
//         return next(new AppError("fileName, contentType, and title are required.", 400));
//     }

//     // Create an options object to pass to the helper function
//     const options = {
//         userId: user?.id || '68ecfd8a31202017aee928c8',
//         title,
//         description: description || '',
//         fileName,
//         contentType,
//     };

//     // Call the helper with the single options object
//     const { signedUrl, objectKey } = await generateUrlToPutObject(options);

//     // Return the correct uploadUrl and objectKey from the helper function
//     res.status(200).json({
//         status: "success",
//         uploadUrl: signedUrl,
//         objectKey: objectKey,
//     });
// });

exports.initializeUpload = async (req, res, next) => {
    console.log("[API] /initialize-upload endpoint hit.");
    const { fileName, fileSize, contentType, title, description, lessonId } = req.body;

    if (!req.user || !req.user._id) {
        return next(new AppError("You must be logged in to upload a video.", 401));
    }
    const userId = req.user._id;

    if (!fileName || !fileSize || !contentType || !title) {
        return next(new AppError("Missing required fields: fileName, fileSize, contentType, title.", 400));
    }

    let signedUrl, objectKey;
    try {
        // --- THE FIX: STEP 1 - PREPARE THE 'OLD STYLE' OPTIONS & CALL THE HELPER FIRST ---
        // We construct the options object exactly as your `generateUrlToPutObject` helper expects.
        console.log("[S3] Preparing options and requesting a secure presigned URL from the helper...");
        const s3Options = {
            userId: userId.toString(),
            title,
            description: description || '',
            fileName,
            contentType,
        };

        // Your helper function is now the source of truth for the key and URL.
        const result = await generateUrlToPutObject(s3Options);
        signedUrl = result.signedUrl;
        objectKey = result.objectKey;

        if (!signedUrl || !objectKey) {
            throw new Error("S3 helper function did not return a valid signedUrl and objectKey.");
        }

        console.log(`[S3] Successfully generated URL and key: ${objectKey}`);

    } catch (error) {
        console.error("[S3] CRITICAL ERROR: Failed to generate the S3 presigned URL.", error);
        return next(new AppError("Could not create a secure link to storage. Please try again.", 500));
    }

    try {
        // --- STEP 2 - CREATE THE DATABASE RECORD (USING THE KEY FROM THE HELPER) ---
        console.log("[DB] Creating initial video record in MongoDB...");
        const newVideo = await Video.create({
            objectKey: objectKey, // Use the key we received from the helper
            owner: userId,
            title: title,
            description: description,
            progress: VIDEO_PROCESS_STATES.INITIALIZING,
            originalFileSize: fileSize,
        });
        console.log(`[DB] Successfully created Video document with ID: ${newVideo._id}`);


        console.log(`[DB] Linking Video ${newVideo._id} to Lesson ${lessonId}...`);
        const lesson = await Lesson.findById(lessonId);
        if (!lesson) {
            // If the lesson doesn't exist, we should probably clean up the created video
            await Video.findByIdAndDelete(newVideo._id);
            return next(new AppError("Lesson not found. Upload cancelled.", 404));
        }

        lesson.video = newVideo._id; // Assign the ObjectId
        await lesson.save();
        console.log(`[DB] Successfully updated Lesson ${lessonId}.`);

        // --- STEP 3 - SEND THE RESPONSE BACK TO THE CLIENT ---
        console.log("[API] Initialization successful. Sending details back to the client.");
        res.status(200).json({
            status: "success",
            videoId: newVideo._id,
            uploadUrl: signedUrl,
            objectKey: objectKey,
        });

    } catch (error) {
        console.error("[DB] CRITICAL ERROR: Failed to create the video document.", error);
        // At this point, the presigned URL has been created, but the DB record failed.
        // This is a rare edge case, but for a pro-level system, you might add cleanup logic here.
        return next(new AppError("A server error occurred while preparing the upload. Please try again.", 500));
    }
};

exports.deleteVideoAndCleanup = async (req, res, next) => {
    const { videoId } = req.params;
    console.log(`[API] Received request to delete video with ID: ${videoId}`);

    try {
        const video = await Video.findById(videoId);
        if (!video) {
            console.log(`[API] Video with ID: ${videoId} not found in database.`);
            // If video is already gone, it's a success from the user's perspective.
            return res.status(204).json({ status: "success", data: null });
        }

        // --- S3 Cleanup ---
        // 1. Delete the original raw video file from the temp/raw bucket.
        if (video.objectKey) {
            console.log(`[S3] Deleting original file from raw bucket: ${video.objectKey}`);
            await deleteS3Object(process.env.TEMP_S3_BUCKET_NAME, video.objectKey);
        }

        // 2. Delete the entire folder of transcoded videos in the final/processed bucket.
        // We'll use the objectKey to derive the folder name for consistency.
        const videoNameWithoutExtension = video.objectKey.split('/').pop().split('.')[0];
        const folderKey = `videos/${videoNameWithoutExtension}/`;

        console.log(`[S3] Deleting processed video folder from final bucket: ${folderKey}`);
        await deleteS3Folder(process.env.FINAL_S3_BUCKET_NAME, folderKey);

        // --- Database Cleanup ---
        console.log(`[DB] Deleting video document from MongoDB: ${videoId}`);
        await Video.findByIdAndDelete(videoId);

        console.log(`[API] Successfully deleted video ${videoId} and all associated files.`);
        res.status(204).json({ status: "success", data: null });

    } catch (error) {
        console.error(`[API] CRITICAL ERROR: Failed during the deletion process for video ${videoId}.`, error);
        return next(new AppError("An error occurred while cleaning up video files. Please check server logs.", 500));
    }
};

exports.getVideo = catchAsync(async (req, res, next) => {
    const video = await Video.findById(req.params.id);

    if (!video) {
        return next(new AppError("No video found with that ID!", 404));
    }

    await video.save();

    res.status(200).json({
        status: "success",
        data: {
            video,
        },
    });
});

exports.getVideoStatus = catchAsync(async (req, res, next) => {
    const video = await Video.findById(req.params.id);

    if (!video) {
        return next(new AppError("No video found with that ID!", 404));
    }

    res.status(200).json({
        status: "success",
        progress: video.progress,
    });
});

exports.getVideos = catchAsync(async (req, res, next) => {
    const videos = await Video.find({ progress: "completed" }).select(
        "-__v -updatedAt -password"
    );

    res.status(200).json({
        status: "success",
        results: videos.length,
        data: {
            videos,
        },
    });
});

exports.getAllVideosByMe = catchAsync(async (req, res, next) => {
    const videos = await Video.find({ owner: req.user._id });

    res.status(200).json({
        status: "success",
        results: videos.length,
        data: {
            videos,
        },
    });
});

exports.updateViews = catchAsync(async (req, res, next) => {
    const video = await Video.findById(req.params.id);

    if (!video) {
        return next(new AppError("No video found with that ID!", 404));
    }

    video.views += 1;
    await video.save();

    res.status(200).json({
        status: "success",
        data: {
            video,
        },
    });
});

exports.resetRedisCache = catchAsync(async (req, res, next) => {
    await deleteAllKeys();

    res.status(200).json({
        status: "success",
        message: "Redis cache cleared!",
    });
});
