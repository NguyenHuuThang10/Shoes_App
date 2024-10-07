const mongoose = require('mongoose')
const Schema = mongoose.Schema
const mongooseDelete = require('mongoose-delete')
const slug = require('mongoose-slug-updater')
const bcrypt = require('bcrypt');

const User = new Schema({
    name: { type: String },
    email: { type: String },
    password: { type: String },
    phone: { type: String },
    resetToken: { type: String },
    activeToken: { type: String },
    status: { type: Number, default: 0 },
    isAdmin: { type: Boolean, default: false },
    wishlistItems: [
        {
            size: { type: Number, required: true },
            shoe: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Shoe',
                required: true,
            },
        }

    ],
    authProvider: { type: String, default: 'local' }, 
    accountId: { type: String },
    shippingAddress: {
        address: { type: String },
        city: { type: String },
        district: { type: String },
        ward: { type: String },
        cityName: { type: String },
        districtName: { type: String },
        wardName: { type: String },
    },
}, {
    conllection: 'users',
    timestamps: true
})

//Add plugin
mongoose.plugin(slug)
User.plugin(mongooseDelete, {
    deletedAt: true, // Thêm thời gian xóa vào db
    overrideMethods: 'all' // Ghi đè chỉ hiện những dữ liệu ko có field deleteAt
});


// Business Logic
User.statics.createUser = async function (userData) {
    try {
        const { name, email, phone, password, confirm_password, isAdmin, status } = userData;
        const regEmail = /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;
        const regPhone = /^0\d{9}$/;
        const isCheckEmail = regEmail.test(email);
        const isCheckPhone = regPhone.test(phone);

        if (!name || !email || !phone || !password || !confirm_password || !isAdmin) {
            throw new Error('Vui lòng nhập đầy đủ thông tin!');
        } else if (!isCheckEmail) {
            throw new Error('Email không đúng định dạng!');
        } else if (!isCheckPhone) {
            throw new Error('Số điện thoại không đúng định dạng!');
        } else if (password !== confirm_password) {
            throw new Error('Nhập lại mật khẩu không trùng khớp!');
        }


        const existingUser = await this.findOne({ email });
        if (existingUser) {
            throw new Error('Email đã tồn tại trong hệ thống!');
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new this({
            name,
            email,
            phone,
            status,
            password: hashedPassword,
            isAdmin: isAdmin === "Admin"
        });
        const success = await newUser.save();
        if (!success) {
            throw new Error('Tạo tài khoản thất bại!');
        }
    } catch (error) {
        throw new Error(error);
    }
}

User.statics.upadteUser = async function (userData, userId) {
    try {
        const { name, email, phone, password, confirm_password, isAdmin, status } = userData;
        const regEmail = /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;
        const regPhone = /^0\d{9}$/;
        const isCheckEmail = regEmail.test(email);
        const isCheckPhone = regPhone.test(phone);

        if (!name || !email || !phone || !isAdmin) {
            throw new Error('Vui lòng nhập đầy đủ thông tin!');
        } else if (!isCheckEmail) {
            throw new Error('Email không đúng định dạng!');
        } else if (!isCheckPhone) {
            throw new Error('Số điện thoại không đúng định dạng!');
        }

        const myUser = await this.findOne({ _id: userId });    
        if (!myUser) {
            throw new Error('Người dùng không tồn tại!');
        }
        const authPro = String(myUser.authProvider);
        const existingUser = await this.findOne({ email, _id: { $ne: userId }, authProvider: authPro});
        console.log(existingUser);
        if (existingUser) {
            throw new Error('Email đã tồn tại trong hệ thống!');
        }

        if (password || confirm_password) {
            if (password !== confirm_password) {
                throw new Error('Nhập lại mật khẩu không trùng khớp!');
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            var success = await this.updateOne({ _id: userId }, {
                name,
                email,
                phone,
                status,
                password: hashedPassword,
                isAdmin: isAdmin === "Admin"
            })

        } else {
            var success = await this.updateOne({ _id: userId }, {
                name,
                email,
                phone,
                status,
                isAdmin: isAdmin === "Admin"
            })
        }

        if (!success) {
            throw new Error('Cập nhật người dùng thất bại!');
        }
    } catch (error) {
        throw new Error(error);
    }
}

User.statics.deleteUser = async function (userId) {
    try {
        await this.delete({ _id: userId })
    } catch (error) {
        console.log("ERR: " + error)
        throw new Error("Không thể xóa người dùng")
    }
}

User.statics.destroyUser = async function (userId) {
    try {
        await this.deleteOne({ _id: userId })
    } catch (error) {
        console.log("ERR: " + error)
        throw new Error("Không thể xóa vĩnh viễn người dùng")
    }
}

User.statics.restoreUser = async function (userId) {
    try {
        await this.restore({ _id: userId })
    } catch (error) {
        console.log("ERR: " + error)
        throw new Error("Không thể khôi phục người dùng")
    }
}


module.exports = mongoose.model('User', User)