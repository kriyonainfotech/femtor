const axios = require("axios");
require("dotenv").config();

// module.exports.handler = async (event) => {
//   try {
//     console.log("S3 trigger received!");
//     console.log(JSON.stringify(event));

//     const s3EventData = event.Records[0].s3;

//     const response = await axios.post(process.env.API_ENDPOINT, {
//       s3EventData,
//     });

//     console.log("API response received!");
//     console.log(`Status: ${response.status} | Data: ${response.data}`);

//     return {
//       statusCode: 200,
//       body: JSON.stringify({
//         status: "success",
//         message: "S3 event trigger processed successfully!",
//         body: response?.data,
//       }),
//     };
//   } catch (error) {
//     console.error(error);
//     return {
//       statusCode: 500,
//       body: JSON.stringify({
//         status: "error",
//         message: "Error processing S3 event trigger!",
//         error: error,
//       }),
//     };
//   }
// };

// In: upload-trigger-api/index.js

exports.handler = async (event) => {
  // Log 1: Acknowledge that the function has been triggered and show the raw event data.
  console.log("LAMBDA TRIGGERED: S3 upload detected. Full event:", JSON.stringify(event, null, 2));

  try {
    // --- Step 1: Extract the file information from the S3 event ---
    const record = event.Records && event.Records[0];
    if (!record) {
      throw new Error("Invalid S3 event format: Missing Records array.");
    }

    const s3Data = record.s3;
    if (!s3Data || !s3Data.object || !s3Data.object.key) {
      throw new Error("Invalid S3 event format: Missing object key.");
    }

    // Decode the object key to correctly handle filenames with spaces (which S3 encodes as '+').
    const objectKey = decodeURIComponent(s3Data.object.key.replace(/\+/g, " "));

    // Log 2: Confirm that the file key was extracted successfully.
    console.log(`LAMBDA: Successfully extracted objectKey: "${objectKey}"`);


    // --- Step 2: Prepare and validate the webhook call ---
    const webhookUrl = process.env.S3_WEBHOOK_URL;
    if (!webhookUrl) {
      throw new Error("LAMBDA FATAL ERROR: S3_WEBHOOK_URL environment variable is not set!");
    }

    // Log 3: Announce the action to be performed.
    console.log(`LAMBDA: Preparing to call webhook URL: ${webhookUrl}`);
    console.log(`LAMBDA: Sending payload: { "objectKey": "${objectKey}" }`);


    // --- Step 3: Call the main server's webhook endpoint ---
    const response = await axios.post(webhookUrl, {
      objectKey: objectKey,
    });


    // Log 4: Confirm that the main server responded successfully.
    console.log("LAMBDA: Webhook called successfully. Server responded with status:", response.status);
    console.log("LAMBDA: Server response data:", response.data);

    // Return a successful response for the Lambda invocation.
    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Webhook triggered successfully" }),
    };

  } catch (error) {
    // Log 5: Catch any errors and provide detailed information for debugging.
    console.error("LAMBDA FAILED:", error.message);

    // If the error came from the API call, log the server's response.
    if (error.response) {
      console.error("LAMBDA ERROR: Server responded with status:", error.response.status);
      console.error("LAMBDA ERROR: Server response data:", JSON.stringify(error.response.data, null, 2));
    }

    // Re-throw the error to ensure AWS Lambda marks this invocation as a failure,
    // which is important for monitoring and alerts.
    throw error;
  }
};