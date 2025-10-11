const { S3Client } = require('@aws-sdk/client-s3');
const multer = require('multer');
const multerS3 = require('multer-s3');
const path = require('path');

// Configure the S3 client
const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

const s3Uploader = multer({
    storage: multerS3({
        s3: s3,
        bucket: process.env.AWS_BUCKET_NAME,
        // --- THE FIX ---
        // We are removing the acl property. Modern S3 buckets disable ACLs by default.
        // By removing this line, the object's permissions will be determined by your bucket policy.
        // acl: 'public-read', 

        metadata: function (req, file, cb) {
            cb(null, { fieldName: file.fieldname });
        },
        key: function (req, file, cb) {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            cb(null, 'profile-pictures/' + file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
        },
    }),
});

module.exports = s3Uploader;

