"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.configureGoogleStrategy = void 0;
const passport_google_oauth20_1 = require("passport-google-oauth20");
const passport_1 = __importDefault(require("passport"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const configureGoogleStrategy = () => {
    passport_1.default.use(new passport_google_oauth20_1.Strategy({
        clientID: process.env.GOOGLE_AUTH_CLIENT_ID || '',
        clientSecret: process.env.GOOGLE_AUTH_CLIENT_SECRET || '',
        callbackURL: process.env.GOOGLE_AUTH_CALLBACK_URL || 'http://localhost:2500/api/v1/user/auth/google/callback',
        passReqToCallback: true
    }, async (req, accessToken, refreshToken, profile, done) => {
        try {
            const { id, displayName, emails, photos } = profile;
            const email = emails && emails[0] ? emails[0].value : null;
            const avatar = photos && photos[0] ? photos[0].value : null;
            req.googleUser = {
                googleId: id,
                email: email,
                name: displayName,
                avatar: avatar,
                callBackUrl: req.originalUrl
            };
            return done(null, req.googleUser);
        }
        catch (error) {
            return done(error, undefined);
        }
    }));
};
exports.configureGoogleStrategy = configureGoogleStrategy;
