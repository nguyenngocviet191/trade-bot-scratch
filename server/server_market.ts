import express, { Request, Response } from 'express';
import cors from 'cors';
// import apiGateway from './api_gateway'; // Import the api_gateway module
import { fetchCryptoPrice, fetchCryptoOHLCV, fetchCryptoPrices } from './services/market';

// Ensure fetchCryptoPrice is correctly imported and handles errors

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

app.get('/', (req: Request, res: Response) => {
    res.send('Welcome to server market');
});
// New route for fetching cryptocurrency prices
app.get('/ticker/:symbol/:base', async (req: Request, res: Response) => {
    const { symbol, base } = req.params;
    console.log(symbol, base);

    try {
        const price = await fetchCryptoPrice(symbol, base);
        res.json({
            timestamp: price.timestamp,
            open: price.open,
            high: price.high,
            low: price.low,
            close: price.close,
            volume: price.volume
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch price' });
    }
});

// New route for fetching candlestick data
app.get('/ohlcv/:symbol/:base/:timeframe', async (req: Request, res: Response) => {
    const { symbol, base, timeframe } = req.params;
    const limit = parseInt(req.query.limit as string) || 20;

    try {
        const ohlcvData = await fetchCryptoOHLCV(symbol, base, timeframe, limit);
        res.json(ohlcvData);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch candlestick data' });
    }
});

// New route for fetching cryptocurrency prices for multiple pairs
app.post('/tickers', async (req: Request, res: Response) => {
    const pairs = req.body.pairs; // Expecting an array of { symbol, base } objects

    try {
        const prices = await fetchCryptoPrices(pairs);
        res.json(prices);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch prices' });
    }
});

export default app;


// Use the api_gateway routes


app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});