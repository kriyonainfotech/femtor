// const { parentPort, workerData } = require("worker_threads");
// const ffmpeg = require("fluent-ffmpeg");
// const path = require("path");
// const fs = require("fs");
// const ffmpegPath = require("ffmpeg-static");

// ffmpeg.setFfmpegPath(ffmpegPath);

// const convertVideo = (format, folderPath, videoPath) => {
//   return new Promise((resolve, reject) => {
//     const outputFolderPath = path.join(folderPath, format.name);
//     if (!fs.existsSync(outputFolderPath)) {
//       fs.mkdirSync(outputFolderPath, { recursive: true });
//     }

//     ffmpeg(videoPath)
//       .outputOptions([
//         "-profile:v baseline",
//         "-level 3.0",
//         `-vf scale=${format.scale}`,
//         "-start_number 0",
//         "-hls_time 10",
//         "-hls_list_size 0",
//         "-f hls",
//       ])
//       .output(path.join(outputFolderPath, "index.m3u8"))
//       .on("end", () => {
//         console.log(`Video converted to ${format.name} successfully!`);
//         resolve();
//       })
//       .on("error", (err) => {
//         console.error(`Error converting video to ${format.name}`);
//         reject(err);
//       })
//       .run();
//   });
// };

// const { format, folderPath, videoPath } = workerData;

// convertVideo(format, folderPath, videoPath)
//   .then(() => {
//     parentPort.postMessage({ status: "success" });
//   })
//   .catch((error) => {
//     parentPort.postMessage({ status: "error", error: error.message });
//   });


const { parentPort, workerData } = require("worker_threads");
const ffmpeg = require("fluent-ffmpeg");
const path = require("path");
const fs = require("fs");
const ffmpegPath = require("ffmpeg-static");

// Point fluent-ffmpeg to the correct ffmpeg binary
ffmpeg.setFfmpegPath(ffmpegPath);

/**
 * Converts a video to a specific HLS format.
 * This runs in a separate thread to avoid blocking the main application.
 */
function convertVideo(format, folderPath, videoPath) {
  return new Promise((resolve, reject) => {
    const outputFolderPath = path.join(folderPath, format.name);
    if (!fs.existsSync(outputFolderPath)) {
      fs.mkdirSync(outputFolderPath, { recursive: true });
    }

    console.log(`[FFMPEG Worker] Starting conversion for ${format.name}...`);

    ffmpeg(videoPath)
      .outputOptions([
        "-profile:v baseline",
        "-level 3.0",
        `-vf scale=${format.scale}`,
        "-start_number 0",
        "-hls_time 10", // 10-second segments
        "-hls_list_size 0",
        "-f hls",
      ])
      .output(path.join(outputFolderPath, "index.m3u8"))
      .on("end", () => {
        console.log(`[FFMPEG Worker] Finished conversion for ${format.name}.`);
        resolve();
      })
      .on("error", (err) => {
        console.error(`[FFMPEG Worker] FAILED conversion for ${format.name}.`, err);
        reject(err);
      })
      .run();
  });
}

// Get the job data passed from the main thread
const { format, folderPath, videoPath } = workerData;

// Execute the conversion
convertVideo(format, folderPath, videoPath)
  .then(() => {
    // Send a success message back to the main thread
    parentPort.postMessage({ status: "success" });
  })
  .catch((error) => {
    // Send an error message back to the main thread
    parentPort.postMessage({ status: "error", error: error.message });
  });
