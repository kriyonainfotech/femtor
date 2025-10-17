const path = require("path");
const fs = require("fs");
const {
  downloadVideo,
  notifyWebhookOfCompletion,
  runParallelTasks,
  generatePlaylistFile,
  uploadFolderToS3Bucket,
  deleteObjectFromTempBucket,
} = require("./utils/video-processing");

// Main async function to run the entire process
(async function main() {
  console.log("--- Video Processing Task Started ---");

  // 1. Get Environment Variables
  const key = process.env.OBJECT_KEY;
  const tempBucketName = process.env.TEMP_S3_BUCKET_NAME;
  const finalBucketName = process.env.FINAL_S3_BUCKET_NAME;

  // Gracefully exit if critical information is missing
  if (!key || !tempBucketName || !finalBucketName) {
    console.error("FATAL: Missing critical environment variables (OBJECT_KEY, TEMP_S3_BUCKET_NAME, or FINAL_S3_BUCKET_NAME). Exiting.");
    process.exit(1);
  }
  console.log(`Processing video with key: "${key}"`);

  // 2. Set up local file paths
  const videoName = key.split("/").pop();
  const videoNameWithoutExtension = videoName.split(".")[0];
  const localFolderPath = path.join(__dirname, "downloads", videoNameWithoutExtension);

  if (!fs.existsSync(localFolderPath)) {
    fs.mkdirSync(localFolderPath, { recursive: true });
  }

  const localVideoPath = path.join(localFolderPath, videoName);

  try {
    // 3. Download the original video file
    await downloadVideo(key, tempBucketName, localVideoPath);

    // 4. Run FFMPEG to transcode into different resolutions
    await runParallelTasks(localFolderPath, localVideoPath);

    // 5. Generate the master playlist file
    generatePlaylistFile(localFolderPath);

    // Clean up the downloaded raw file to save space
    fs.unlinkSync(localVideoPath);

    // 6. Upload the entire folder of transcoded files to the final S3 bucket
    const allLinks = await uploadFolderToS3Bucket(
      localFolderPath,
      finalBucketName,
      videoNameWithoutExtension
    );

    // 7. Notify the backend server that the job is complete
    await notifyWebhookOfCompletion(key, allLinks);

    // 8. Delete the original file from the temporary bucket
    await deleteObjectFromTempBucket(key);

    console.log("--- Video Processing Task Completed Successfully ---");
    process.exit(0);

  } catch (error) {
    console.error("--- A FATAL ERROR occurred during video processing ---", error);
    // Optionally, you could add a webhook call here to notify of failure
    process.exit(1);
  }
})();
