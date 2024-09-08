const multer = require("multer");
const path = require('path')
const crypto = require('crypto');

function createUploadMiddleware(uploadPath) {
    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, path.join(__dirname, uploadPath));
        },
        filename: function (req, file, cb) {
            const uniqueSuffix = crypto.randomBytes(3).toString('hex');
            cb(null, Date.now() + uniqueSuffix + path.extname(file.originalname));
        },
    });

    return multer({ storage: storage });
}


module.exports = createUploadMiddleware
