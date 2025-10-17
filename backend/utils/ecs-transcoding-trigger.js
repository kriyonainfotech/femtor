// const { ECSClient, RunTaskCommand } = require("@aws-sdk/client-ecs");

// const ecsClient = new ECSClient({
//     region: process.env.AWS_REGION,
//     credentials: {
//         accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//         secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
//     },
// });

// const config = {
//     CLUSTER: process.env.ECS_CLUSTER_ARN,
//     TASK: process.env.ECS_TASK_DEFINITION_ARN,
// };

// const listOfSubnets = process.env.SUBNET_IDS.split(",");
// const listOfSecurityGroups = process.env.SECURITY_GROUP_IDS.split(",");

// async function triggerTranscodingJob(job) {
//     try {
//         const command = new RunTaskCommand({
//             cluster: config.CLUSTER,
//             taskDefinition: config.TASK,
//             launchType: "FARGATE",
//             count: 1,
//             networkConfiguration: {
//                 awsvpcConfiguration: {
//                     subnets: listOfSubnets,
//                     assignPublicIp: "ENABLED",
//                     securityGroups: listOfSecurityGroups,
//                 },
//             },
//             overrides: {
//                 containerOverrides: [
//                     {
//                         name: "transcoder-container",
//                         environment: [
//                             { name: "OBJECT_KEY", value: job.objectKey },
//                             {
//                                 name: "TEMP_S3_BUCKET_NAME",
//                                 value: process.env.TEMP_S3_BUCKET_NAME,
//                             },
//                             {
//                                 name: "FINAL_S3_BUCKET_NAME",
//                                 value: process.env.FINAL_S3_BUCKET_NAME,
//                             },
//                             {
//                                 name: "MY_AWS_REGION",
//                                 value: process.env.MY_AWS_REGION,
//                             },
//                             {
//                                 name: "MY_AWS_ACCESS_KEY_ID",
//                                 value: process.env.MY_AWS_ACCESS_KEY_ID,
//                             },
//                             {
//                                 name: "MY_AWS_SECRET_ACCESS_KEY",
//                                 value: process.env.MY_AWS_SECRET_ACCESS_KEY,
//                             },
//                             { name: "WEBHOOK_URL", value: process.env.WEBHOOK_URL },
//                             {
//                                 name: "THUMBNAIL_API_ENDPOINT",
//                                 value: process.env.THUMBNAIL_API_ENDPOINT,
//                             },
//                             {
//                                 name: "SUBTITLE_API_ENDPOINT",
//                                 value: process.env.SUBTITLE_API_ENDPOINT,
//                             },
//                         ],
//                     },
//                 ],
//             },
//             tags: [
//                 {
//                     key: "Purpose",
//                     value: "Video Transcoding",
//                 },
//             ],
//         });

//         await ecsClient.send(command);
//     } catch (error) {
//         console.log("Error occured while triggering transcoding job");
//         console.log(error);
//         throw error;
//     }
// }

// module.exports = { triggerTranscodingJob };

const { ECSClient, RunTaskCommand } = require("@aws-sdk/client-ecs");

// Initialize the ECS Client. It will use credentials from your backend's environment.
const ecsClient = new ECSClient({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

/**
 * Triggers a new Fargate task to process a video.
 * @param {object} job - Contains the objectKey for the video to be processed.
 */
async function triggerTranscodingJob(job) {
    console.log(`[ECS Trigger] Starting task for object: ${job.objectKey}`);

    // These values MUST exist in your backend server's .env file.
    const requiredEnvVars = [
        'ECS_CLUSTER_ARN', 'ECS_TASK_DEFINITION_ARN', 'SUBNET_IDS',
        'SECURITY_GROUP_IDS', 'ECS_CONTAINER_NAME', 'TEMP_S3_BUCKET_NAME',
        'FINAL_S3_BUCKET_NAME', 'AWS_REGION', 'AWS_ACCESS_KEY_ID',
        'AWS_SECRET_ACCESS_KEY', 'WEBHOOK_URL'
    ];

    console.log(`[ECS Trigger] USING TASK DEFINITION ARN: ${process.env.ECS_TASK_DEFINITION_ARN}`);

    for (const v of requiredEnvVars) {
        if (!process.env[v]) {
            console.error(`[ECS Trigger] FATAL ERROR: Missing required environment variable on backend server: ${v}`);
            throw new Error(`Configuration error: Missing ${v}`);
        }
    }

    const command = new RunTaskCommand({
        cluster: process.env.ECS_CLUSTER_ARN,
        taskDefinition: process.env.ECS_TASK_DEFINITION_ARN,
        launchType: "FARGATE",
        count: 1,
        networkConfiguration: {
            awsvpcConfiguration: {
                subnets: process.env.SUBNET_IDS.split(","),
                securityGroups: process.env.SECURITY_GROUP_IDS.split(","), // Make sure you have this variable
                assignPublicIp: "ENABLED",
            },
        },
        overrides: {
            containerOverrides: [
                {
                    // This name MUST match the container name in your Task Definition
                    name: process.env.ECS_CONTAINER_NAME,

                    // These variables are securely passed INTO the container environment
                    environment: [
                        { name: "OBJECT_KEY", value: job.objectKey },
                        { name: "TEMP_S3_BUCKET_NAME", value: process.env.TEMP_S3_BUCKET_NAME },
                        { name: "FINAL_S3_BUCKET_NAME", value: process.env.FINAL_S3_BUCKET_NAME },
                        { name: "AWS_REGION", value: process.env.AWS_REGION },
                        { name: "AWS_ACCESS_KEY_ID", value: process.env.AWS_ACCESS_KEY_ID },
                        { name: "AWS_SECRET_ACCESS_KEY", value: process.env.AWS_SECRET_ACCESS_KEY },
                        { name: "WEBHOOK_URL", value: process.env.WEBHOOK_URL },
                    ],
                },
            ],
        },
    });

    try {
        const response = await ecsClient.send(command);
        const taskArn = response.tasks[0].taskArn;
        console.log(`[ECS Trigger] Successfully launched task with ARN: ${taskArn}`);
        return response;
    } catch (error) {
        console.error("[ECS Trigger] Error launching ECS task:", error);
        throw error;
    }
}

module.exports = { triggerTranscodingJob };
