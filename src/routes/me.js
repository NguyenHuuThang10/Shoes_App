const express = require("express");
const router = express.Router();
const upload = require('../app/middlewares/uploads')

const meController = require("../app/controllers/MeController");

router.post("/create/blogs", meController.checkLoginAdmin, upload.single('avatar'), meController.storeBlogs);
router.get("/create/blogs", meController.checkLoginAdmin, meController.createBlogs);

router.get("/stored/shoes", meController.checkLoginAdmin, meController.storedShoes);
router.get("/trash/shoes", meController.checkLoginAdmin, meController.trashShoes);
router.get("/create/shoes", meController.checkLoginAdmin, meController.createShoes);
router.post("/store/shoes", meController.checkLoginAdmin, upload.single('image'), meController.storeShoes);
router.get("/:id/edit/shoes", meController.checkLoginAdmin, meController.editShoes);
router.put("/:id/update/shoes", meController.checkLoginAdmin, upload.single('image'), meController.updateShoes);
router.delete("/:id/delete/shoes", meController.checkLoginAdmin, meController.deleteShoes);
router.delete("/:id/destroy/shoes", meController.checkLoginAdmin, meController.destroyShoes);
router.patch("/:id/restore/shoes", meController.checkLoginAdmin, meController.restoreShoes);


router.get("/stored/users", meController.checkLoginAdmin, meController.storedUsers);
router.get("/trash/users", meController.checkLoginAdmin, meController.trashUsers);
router.get("/create/users", meController.checkLoginAdmin, meController.createUsers);
router.post("/create/users", meController.checkLoginAdmin, meController.storeUsers);
router.get("/:id/edit/users", meController.checkLoginAdmin, meController.editUsers);
router.put("/:id/edit/users", meController.checkLoginAdmin, meController.updateUsers);
router.delete("/:id/delete/users", meController.checkLoginAdmin, meController.deleteUsers);
router.delete("/:id/destroy/users", meController.checkLoginAdmin, meController.destroyUsers);
router.patch("/:id/restore/users", meController.checkLoginAdmin, meController.restoreUsers);

router.put("/:id/edit/order", meController.checkLoginAdmin, meController.updateOrder);
router.get("/:id/edit/order", meController.checkLoginAdmin, meController.editOrder);
router.delete("/:id/destroy/order", meController.checkLoginAdmin, meController.destroyOrder);
router.patch("/:id/restore/order", meController.checkLoginAdmin, meController.restoreOrder);
router.get("/trash/orders", meController.checkLoginAdmin, meController.trashOrders);
router.delete("/:id/delete/order", meController.checkLoginAdmin, meController.deleteOrder);
router.get("/stored/orders", meController.checkLoginAdmin, meController.storedOrders);
router.get("/stored/order-detail/:id", meController.checkLoginAdmin, meController.orderDetail);


router.get("/home", meController.checkLoginAdmin, meController.index);

module.exports = router;
