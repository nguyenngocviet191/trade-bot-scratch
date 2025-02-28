import ccxt from 'ccxt';

export async function fetchCryptoPrice(symbol: string, base: string) {
    try {
        const exchange = new ccxt.binance();
        const ticker = await exchange.fetchTicker(`${symbol}/${base}`);
        console.log(`Giá ${symbol}/${base} hiện tại: ${ticker.last} ${base}`);
        return ticker.last;
    } catch (error) {
        console.error(`Lỗi khi lấy giá ${symbol}/${base}:`, error);
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
        console.log(`Dữ liệu nến ${symbol}/${base} trong ${timeframe}:`, ohlcv);
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