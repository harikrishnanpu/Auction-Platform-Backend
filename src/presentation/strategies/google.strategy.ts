import { Strategy as GoogleStrategy, Profile, VerifyCallback } from 'passport-google-oauth20';
import passport from 'passport';
import dotenv from 'dotenv';
dotenv.config();

export const configureGoogleStrategy = () => {
    passport.use(
        new GoogleStrategy(
            {
                clientID: process.env.GOOGLE_AUTH_CLIENT_ID || '',
                clientSecret: process.env.GOOGLE_AUTH_CLIENT_SECRET || '',
                callbackURL: process.env.GOOGLE_AUTH_CALLBACK_URL || 'http://localhost:2500/api/v1/user/auth/google/callback',
                passReqToCallback: true
            },
            async (req: any, accessToken: string, refreshToken: string, profile: Profile, done: VerifyCallback) => {
                try {
                    // Profile info
                    const { id, displayName, emails, photos } = profile;
                    const email = emails && emails[0] ? emails[0].value : null;
                    const avatar = photos && photos[0] ? photos[0].value : null;

                    if (!email) {
                        return done(new Error('No email found in Google profile'));
                    }

                    // Attach to request for controller to handle
                    req.googleUser = {
                        googleId: id,
                        email: email,
                        name: displayName,
                        avatar: avatar
                    };

                    return done(null, req.googleUser);
                } catch (error) {
                    return done(error as Error, undefined);
                }
            }
        )
    );
};
