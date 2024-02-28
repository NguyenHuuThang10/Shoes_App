const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require('path')

const meController = require("../app/controllers/MeController");


// import img
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../public/uploads'));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage: storage });

router.post("/store/shoes", upload.single('image'), meController.storeShoes);
router.get("/create/shoes", meController.createShoes);
router.get("/stored/shoes", meController.storedShoes);
router.get("/trash/shoes", meController.trashShoes);
router.get("/:id/edit/shoes", meController.editShoes);
router.put("/:id/update/shoes", upload.single('image'), meController.updateShoes);
router.delete("/:id/delete/shoes", meController.delete);
router.delete("/:id/destroy/shoes", meController.destroy);
router.patch("/:id/restore/shoes", meController.restore);
router.get("/home", meController.index);

module.exports = router;
