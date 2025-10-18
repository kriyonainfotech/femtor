const { WebSocket } = require("ws"); // 1. Import WebSocket to check connection status
const { userConnections } = require("../utils/websocket"); // 2. Import the live connections map
const { redisClient } = require("../redis/redis");

require("dotenv").config();

const { decrement, getQueueLength, increment, dequeueJobFromQueue } = require("../redis/redis");
const { REDIS_KEYS, VIDEO_PROCESS_STATES } = require("../constants");
const { triggerTranscodingJob } = require("../utils/ecs-transcoding-trigger");

const Video = require("../model/videoModel");
const { getObjectMetadata } = require("../utils/s3-signed-url");


// --- 2. CREATE A HELPER FUNCTION TO SEND OR QUEUE MESSAGES ---
/**
 * Sends a message to a user if they are connected, otherwise queues it in Redis.
 * @param {string} userId The ID of the user to notify.
 * @param {object} message The message object to send.
 */
async function sendOrQueueMessage(userId, message) {
    const userSocket = userConnections.get(userId);
    const messageString = JSON.stringify(message);

    if (userSocket && userSocket.readyState === WebSocket.OPEN) {
        console.log(`[WebSocket] User ${userId} is online. Sending message directly.`);
        userSocket.send(messageString);
    } else {
        console.log(`[Redis] User ${userId} is offline. Queuing message in their mailbox.`);
        const redisKey = `notifications:${userId}`;
        // THE FIX: Use lowercase 'rpush'
        await redisClient.rpush(redisKey, messageString);
    }
}


/**
 * Webhook #1: Triggered by S3 (via Lambda) when a file upload is completed.
 * This function's job is to:
 * 1. Find the video record that was created by `initializeUpload`.
 * 2. Update its status to 'processing'.
 * 3. Calculate an estimated processing time.
 * 4. Notify the frontend via WebSocket that processing has officially begun.
 * 5. Trigger the actual ECS transcoding task.
 */
exports.handleS3Trigger = async (req, res, next) => {
    console.log("--- S3 TRIGGER WEBHOOK RECEIVED ---");
    const { objectKey } = req.body;

    try {
        // --- THIS IS THE FIX ---
        // 1. Check if the objectKey exists in the request body.
        if (!req.body.objectKey) {
            console.error("[S3 Trigger] FAILED: Webhook did not contain an 'objectKey'.");
            return res.status(400).json({ message: "Missing objectKey in request body." });
        }

        // 2. Decode the incoming objectKey from the AWS webhook.
        const decodedObjectKey = decodeURIComponent(req.body.objectKey.replace(/\+/g, ' '));
        console.log(`[S3 Trigger] Received key: "${req.body.objectKey}". Decoded to: "${decodedObjectKey}"`);
        // --- END OF FIX ---

        // 3. Use the DECODED key to find the video in the database.
        const video = await Video.findOne({ objectKey: decodedObjectKey });

        if (!video) {
            console.error(`[S3 Trigger] FAILED: A video with decoded objectKey "${decodedObjectKey}" was not found in the database. This should not happen.`);
            return res.status(404).json({ message: "Video record not found for the given key." });
        }

        console.log(`[S3 Trigger] Found video ${video._id}. Updating its status to 'processing'.`);
        video.progress = VIDEO_PROCESS_STATES.PROCESSING;

        // --- Calculate and save the estimated processing time ---
        // try {
        //     const metadata = await getObjectMetadata(objectKey);
        //     if (metadata.contentLength) {
        //         video.estimatedProcessingTime = calculateProcessingTime(metadata.contentLength);
        //         console.log(`[S3 Trigger] Estimated processing time: ${Math.ceil(video.estimatedProcessingTime / 60)} minutes.`);
        //     }
        // } catch (metaError) {
        //     console.warn(`[S3 Trigger] Warning: Could not fetch metadata to estimate time for ${objectKey}.`, metaError);
        // }
        // await video.save();

        // --- 3. USE THE NEW HELPER FUNCTION ---
        // const userId = video.owner.toString();
        // const processingMessage = {
        //     videoId: video._id.toString(),
        //     status: VIDEO_PROCESS_STATES.PROCESSING,
        //     estimatedProcessingTime: video.estimatedProcessingTime
        // };
        // await sendOrQueueMessage(userId, processingMessage);

        // --- Trigger the ECS task to do the heavy lifting ---
        console.log("[S3 Trigger] Triggering the ECS transcoding job.");
        await triggerTranscodingJob({ objectKey });

        // Respond to the Lambda to let it know the request was accepted.
        res.status(200).json({ status: "success", message: "Processing job successfully triggered." });

    } catch (error) {
        console.error("[S3 Trigger] FATAL ERROR:", error);
        const videoToFail = await Video.findOne({ objectKey });
        if (videoToFail) {
            videoToFail.progress = VIDEO_PROCESS_STATES.FAILED;
            videoToFail.error = "A critical error occurred when starting the processing job.";
            await videoToFail.save();
        }
        next(error); // Pass the error to your global error handler.
    }
};

/**
 * Webhook #2: Triggered by the ECS task when transcoding is complete OR has failed.
 * This function's job is to:
 * 1. Find the video record.
 * 2. Update its final status ('completed' or 'failed').
 * 3. Save the final video resolution URLs.
 * 4. Notify the frontend via WebSocket that the job is finished.
 */
exports.handleECSTrigger = async (req, res, next) => {
    console.log("--- ECS TRIGGER WEBHOOK RECEIVED ---");
    const { key, progress, videoResolutions } = req.body;

    try {
        console.log(`[DB Lookup] Searching for Video document with objectKey: "${key}"`);

        const video = await Video.findOne({ objectKey: key });
        if (!video) {
            console.error(`[DB Lookup] FAILED: Video with objectKey "${key}" was NOT FOUND in the database.`);
            console.error("[DB Lookup] This is the final step, and it failed. The HLS links will be lost.");
            return res.status(404).json({ message: "Video not found!" });
        }

        console.log(`[DB Lookup] SUCCESS: Found video with ID: ${video._id}. Now updating...`);

        video.progress = progress; // will be 'completed' or 'failed'
        video.videoResolutions = videoResolutions;
        await video.save();
        console.log(`[DB] Updated video ${video._id} with final status: ${progress}`);

        // --- 4. USE THE NEW HELPER FUNCTION AGAIN ---
        const userId = video.owner.toString();
        const finalMessage = {
            videoId: video._id.toString(),
            status: progress,
            videoResolutions,
        };
        await sendOrQueueMessage(userId, finalMessage);

        // --- Your Redis and queue logic can go here ---
        // For example, decrementing the active job counter.
        await decrement(REDIS_KEYS.CURRENT_VIDEO_TRANSCODING_JOB_COUNT);

        // Respond to the ECS task to let it know the webhook was successful.
        res.status(200).json({ message: "ECS trigger processed successfully." });

    } catch (error) {
        console.error("[ECS Trigger] FATAL ERROR:", error);
        next(error);
    }
};
