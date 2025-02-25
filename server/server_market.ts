import express, { Request, Response } from 'express';
import cors from 'cors';
// import apiGateway from './api_gateway'; // Import the api_gateway module
import { fetchCryptoPrice } from './services/market';

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

app.get('/', (req: Request, res: Response) => {
    res.send('Welcome to server market');
});
// New route for fetching cryptocurrency prices
app.get('/crypto/:symbol/:base/:timeframe', async (req: Request, res: Response) => {
    const { symbol, base, timeframe } = req.params;
    console.log(symbol,base,timeframe);

    try {
        const price = await fetchCryptoPrice(symbol, base, timeframe);
        res.json({ price });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch price' });
    }
});

export default app;


// Use the api_gateway routes


app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});