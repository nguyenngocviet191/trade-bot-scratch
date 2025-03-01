import ccxt from 'ccxt';

export async function fetchCryptoPrice(symbol: string, base: string) {
    try {
        const exchange = new ccxt.binance();
        const ticker = await exchange.fetchTicker(`${symbol}/${base}`);
        const { timestamp, open, high, low, close, baseVolume: volume } = ticker;
        // console.log(`Giá ${symbol}/${base} hiện tại: timestamp=${timestamp}, open=${open}, high=${high}, low=${low}, close=${close}, volume=${volume}`);
        return { timestamp, open, high, low, close, volume };
    } catch (error) {
        console.error(`Lỗi khi lấy giá ${symbol}/${base}:`, error);
        throw error;
    }
}

export async function fetchCryptoPrices(pairs: { symbol: string, base: string }[]) {
    try {
        const exchange = new ccxt.binance();
        const results = await Promise.all(pairs.map(async pair => {
            const ticker = await exchange.fetchTicker(`${pair.symbol}/${pair.base}`);
            const { timestamp, open, high, low, close, baseVolume: volume } = ticker;
            console.log(`Giá ${pair.symbol}/${pair.base} hiện tại: timestamp=${timestamp}, open=${open}, high=${high}, low=${low}, close=${close}, volume=${volume}`);
            return { symbol: pair.symbol, base: pair.base, timestamp, open, high, low, close, volume };
        }));
        return results;
    } catch (error) {
        console.error(`Lỗi khi lấy giá các cặp tiền:`, error);
        throw error;
    }
}

export async function fetchCryptoOHLCV(symbol: string, base: string, timeframe: string, limit: number) {
    try {
        const exchange = new ccxt.binance();
        const ohlcv = await exchange.fetchOHLCV(`${symbol}/${base}`, timeframe, undefined, limit);
        ohlcv.map(candle => ({ // Chuyển đổi dữ liệu nến từ ccxt sang dạng dữ liệu mà client có thể hiểu
            timestamp: candle[0],
            open: candle[1],
            high: candle[2],
            low: candle[3],
            close: candle[4],
            volume: candle[5]
        }));
        // console.log(`Dữ liệu nến ${symbol}/${base} trong ${timeframe}:`, ohlcv);
        return ohlcv
        ;
    } catch (error) {
        console.error(`Lỗi khi lấy dữ liệu nến ${symbol}/${base}:`, error);
        throw error;
    }
}

// Chạy hàm
// fetchCryptoPrice('BTC', 'USDT' );
// fetchCryptoOHLCV('BTC', 'USDT', '1h',20);