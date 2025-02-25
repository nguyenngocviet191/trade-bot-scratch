import ccxt from 'ccxt';

export async function fetchCryptoPrice(symbol: string, base: string, timeframe: string) {
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

// Chạy hàm
// fetchCryptoPrice('BTC', 'USDT', '1h');