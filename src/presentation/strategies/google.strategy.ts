import { Strategy as GoogleStrategy, Profile, VerifyCallback } from 'passport-google-oauth20';
import passport from 'passport';
import dotenv from 'dotenv';
dotenv.config();


interface Request extends Express.Request {
    googleUser?: any;
    originalUrl?: string;
}

const CLIENT_ID = process.env.GOOGLE_AUTH_CLIENT_ID
const CLIENT_SECRET = process.env.GOOGLE_AUTH_CLIENT_SECRET
const CALL_BACK_URL = process.env.GOOGLE_AUTH_CALLBACK_URL

export const configureGoogleStrategy = () => {
    passport.use(
        new GoogleStrategy(
            {
                clientID: CLIENT_ID || '',
                clientSecret: CLIENT_SECRET || '',
                callbackURL: CALL_BACK_URL || '',
                passReqToCallback: true
            },
            async (req: Request, accessToken: string, refreshToken: string, profile: Profile, done: VerifyCallback) => {
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
                } catch (error) {
                    return done(error as Error, undefined);
                }
            }
        )
    );
};
