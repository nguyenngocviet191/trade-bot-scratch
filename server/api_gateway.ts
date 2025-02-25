import express, { Request, Response } from 'express';
import session from 'express-session';
// import server_market from './server_market';// Import the api_gateway module
import { createProxyMiddleware } from 'http-proxy-middleware';
const app = express();

// Configure session middleware
app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true
}));

// Define routes
app.get('/', (req: Request, res: Response) => {
    res.send('Welcome to the API Gateway');
});

// app.use('/market', server_market); // Use the apiGateway module as a middleware
app.use('/market', createProxyMiddleware({ target: 'http://localhost:5001', changeOrigin: true }));

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});