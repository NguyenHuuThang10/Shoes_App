const multer = require("multer");
const { S3Client } = require("@aws-sdk/client-s3");
const multerS3 = require("multer-s3");
const path = require("path");

// Khởi tạo client S3 với thông tin từ biến môi trường
const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

const bucketName = process.env.AWS_BUCKET_NAME;

// Hàm khởi tạo middleware với đường dẫn upload
function createUploadMiddleware(folder = "") {
    return multer({
        storage: multerS3({
            s3: s3,
            bucket: bucketName,
            key: function (req, file, cb) {
                const uniqueSuffix = Date.now().toString() + '-' + Math.round(Math.random() * 1E9);
                const fileName = uniqueSuffix + path.extname(file.originalname);
                cb(null, `${folder}/${fileName}`);  // Đường dẫn trên S3 bucket
            }
        })
    });
}

module.exports = createUploadMiddleware;

