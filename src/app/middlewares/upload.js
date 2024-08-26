const multer = require("multer");
const path = require('path')

function createUploadMiddleware(uploadPath) {
    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, path.join(__dirname, uploadPath));
        },
        filename: function (req, file, cb) {
            cb(null, Date.now() + path.extname(file.originalname));
        },
    });
    return multer({ storage: storage });
}


module.exports = createUploadMiddleware