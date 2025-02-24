// filepath: /d:/Projects/trade-bot-scratch/api_gateway.ts
import express, { Request, Response } from 'express';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import session from 'express-session';

const app = express();

// Configure session middleware
app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true
}));

// Initialize Passport and restore authentication state, if any, from the session
app.use(passport.initialize());
app.use(passport.session());

// Configure Passport to use Google OAuth 2.0 strategy
passport.use(new GoogleStrategy({
    clientID: 'YOUR_GOOGLE_CLIENT_ID',
    clientSecret: 'YOUR_GOOGLE_CLIENT_SECRET',
    callbackURL: 'http://localhost:3000/auth/google/callback'
},
function(accessToken: string, refreshToken: string, profile: any, done: any) {
    // In a real application, you would save the user profile to your database here
    return done(null, profile);
}));

// Serialize user into the sessions
passport.serializeUser((user: any, done: any) => {
    done(null, user);
});

// Deserialize user from the sessions
passport.deserializeUser((obj: any, done: any) => {
    done(null, obj);
});

// Define routes
app.get('/', (req: Request, res: Response) => {
    res.send('<a href="/auth/google">Login with Google</a>');
});

app.get('/auth/google',
    passport.authenticate('google', { scope: ['https://www.googleapis.com/auth/plus.login'] })
);

app.get('/auth/google/callback', 
    passport.authenticate('google', { failureRedirect: '/' }),
    (req: Request, res: Response) => {
        // Successful authentication, redirect home.
        res.redirect('/profile');
    }
);

app.get('/profile', (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
        return res.redirect('/');
    }
    res.send(`Hello, ${(req.user as any).displayName}`);
});

app.get('/logout', (req: Request, res: Response) => {
    req.logout();
    res.redirect('/');
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});