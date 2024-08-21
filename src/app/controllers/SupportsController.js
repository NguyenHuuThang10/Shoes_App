const User = require("../models/User");
const Shoe = require("../models/Shoe");
const Blog = require("../models/Blog");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {
    mongooseToObject,
    mutipleMongooseToObject,
} = require("../../util/mongoose");
class SupportsController {

    // [GET] /wishlist
    async wishlist(req, res, next) {
        try {
            var token = req.cookies.token;
            if (token) {
                const userId = jwt.verify(token, "nht");
                const wishlist = await User.findOne({
                    _id: userId
                })
                    .populate("wishlistItems.shoe");

                res.render("supports/wishlist", {
                    user: mongooseToObject(wishlist),
                    wishlistEmpty: "Chưa có sản phẩm trong mục Yêu Thích."
                })
            } else {
                res.redirect("/login");
            }
        } catch (error) {
            console.log("ERR CART: " + error);
        }
    }

    // [POST] /add-wishlist
    async addWishlist(req, res, next) {
        try {
            const { shoeId, size } = req.body;

            var userId = res.locals.currentUser._id

            const wishlist = await User.findOne({ _id: userId });
            const shoe = await Shoe.findOne({ _id: shoeId });

            wishlist.wishlistItems.push({
                size: size,
                shoe: shoe._id,
            })
            await wishlist.save();
            return res.redirect('back');


        } catch (error) {
            console.error(error);
            return res
                .status(500)
                .json({ success: false, message: "Internal server error" });
        }

    }

    // [DELETE] /delete-wishlist/:id
    async deleteWishlist(req, res, next) {
        try {
            const wishlistItemId = req.params.id;
            const user = await User.findOneAndUpdate(
                { "wishlistItems._id": wishlistItemId },
                { $pull: { wishlistItems: { _id: wishlistItemId } } },
                { new: true }
            );

            await user.save();
            return res.redirect('back');
        } catch (error) {
            // Xử lý lỗi nếu có
            console.error("Lỗi khi xóa wishlistItem:", error);
            return res
                .status(500)
                .json({ message: "Đã xảy ra lỗi khi xóa wishlistItem" });
        }
    }

    //[GET] /blogs
    blogs(req, res, next) {
        Blog.find({})
            .then((blog) => {
                res.render('blogs/blogsCategory', {
                    blog: mutipleMongooseToObject(blog),
                    category: "Tất cả bài viết"
                });
            })
            .catch(next)
    }

    //[GET] /blogs/:slugCategory
    blogCategory(req, res, next) {
        let slugCategory = req.params.slugCategory;

        Blog.findOne({ slugCategory })
            .then((categoryBlogs) => {
                if (categoryBlogs) {
                    return Blog.find({ slugCategory: slugCategory })
                        .then((blog) => {
                            res.render('blogs/blogsCategory', {
                                blog: mutipleMongooseToObject(blog),
                                category: categoryBlogs.category
                            });
                        })
                } else {
                    res.send("Trang không tồn tại");
                }

            })
            .catch(next)

    }

    //[GET] /blogs/:slugCategory/:slug
    blogDetail(req, res, next) {
        let slug = req.params.slug;
        let slugCategory = req.params.slugCategory

        Blog.findOne({ slug, slugCategory })
            .then((blog) => {
                if (blog) {
                    res.render('blogs/blogDetail', {
                        blog: mongooseToObject(blog)
                    })
                } else {
                    res.send("Trang không tồn tại!")
                }
            })
            .catch(next)
    }
}


module.exports = new SupportsController();