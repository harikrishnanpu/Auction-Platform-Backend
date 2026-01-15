import { Strategy as GoogleStrategy, Profile, VerifyCallback } from 'passport-google-oauth20';
import passport from 'passport';
import dotenv from 'dotenv';
dotenv.config();


interface Request extends Express.Request {
    googleUser?: any;
    originalUrl?: string;
}

export const configureGoogleStrategy = () => {
    passport.use(
        new GoogleStrategy(
            {
                clientID: process.env.GOOGLE_AUTH_CLIENT_ID || '',
                clientSecret: process.env.GOOGLE_AUTH_CLIENT_SECRET || '',
                callbackURL: process.env.GOOGLE_AUTH_CALLBACK_URL || 'http://localhost:2500/api/v1/user/auth/google/callback',
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
