const passport = require('passport');
const User = require('../app/models/User')
const GoogleStrategy = require('passport-google-oauth2').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
require('dotenv').config()

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/callback",
    passReqToCallback: true
},
    async function (request, accessToken, refreshToken, profile, done) {
        try {
            let user = await User.findOne({ accountId: profile.id, authProvider: 'google' });

            if (!user) {
                user = new User({
                    name: profile.displayName,
                    email: profile.emails[0].value,
                    password: null,
                    phone: null,
                    resetToken: null,
                    activeToken: null,
                    isAdmin: false,
                    wishlistItems: [],
                    authProvider: 'google',
                    accountId: profile.id,
                });

                await user.save();
            }

            done(null, user);
        } catch (err) {
            done(err, false);
        }
    }
));

passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_CLIENT_ID,
    clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/facebook/callback",
    profileFields: ['id', 'displayName', 'email'], 
    passReqToCallback: true
},
    async function (request, accessToken, refreshToken, profile, done) {
        try {
            console.log("Profile: " , profile);
            let user = await User.findOne({ accountId: profile.id, authProvider: 'facebook' });

            if (!user) {
                user = new User({
                    name: profile.displayName,
                    email: null,
                    password: null,
                    phone: null,
                    resetToken: null,
                    activeToken: null,
                    isAdmin: false,
                    wishlistItems: [],
                    authProvider: 'facebook',
                    accountId: profile.id,
                });

                await user.save();
            }

            done(null, user);
        } catch (err) {
            done(err, false);
        }
    }
));

passport.serializeUser((user, done) => {
    done(null, user._id)
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id).exec();
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});
