import unittest
import pandas as pd
import numpy as np
from unittest.mock import Mock, patch, AsyncMock, MagicMock
import sys
import os
import asyncio
from datetime import datetime

# Add server directory to path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..', 'server'))

from services.ccxt_service import (
    _process_data, 
    _create_embedding, 
    _select_ohlcv_data,
    _task_index,
    _get_nearest_vector,
    get_similar_ohlcv,
    get_ccxt_ohlcv,
    get_ccxt_ohlcv_batch
)


class TestCcxtService(unittest.TestCase):
    """Unit tests for ccxt_service module."""
    
    def setUp(self):
        """Set up test fixtures before each test method."""
        # Mock OHLCV data
        self.mock_ohlcv = [
            [1640995200000, 50000, 50200, 49900, 50100, 100],  # timestamp, open, high, low, close, volume
            [1640995260000, 50100, 50300, 50050, 50200, 150],
            [1640995320000, 50200, 50400, 50100, 50300, 200],
        ]
        
        # Mock processed DataFrame
        self.mock_df = pd.DataFrame({
            'timestamp': pd.to_datetime([1640995200000, 1640995260000, 1640995320000], unit='ms'),
            'open': [50000, 50100, 50200],
            'high': [50200, 50300, 50400],
            'low': [49900, 50050, 50100],
            'close': [50100, 50200, 50300],
            'volume': [100, 150, 200],
            'ema10': [50100, 50150, 50200],
            'sma20': [50050, 50100, 50150],
            'sma50': [50000, 50050, 50100],
            'sma200': [49950, 50000, 50050],
            'adx': [25.5, 26.0, 26.5],
            'di+': [30.0, 31.0, 32.0],
            'di-': [20.0, 21.0, 22.0],
            'symbol': ['BTC/USDT', 'BTC/USDT', 'BTC/USDT'],
            'tf': ['1d', '1d', '1d']
        })
    
    def test_process_data(self):
        """Test data processing function."""
        result = _process_data(self.mock_ohlcv, "BTC/USDT", "1d")
        
        # Check basic structure
        self.assertIsInstance(result, pd.DataFrame)
        self.assertEqual(len(result), 3)
        
        # Check required columns
        required_columns = [
            'timestamp', 'open', 'high', 'low', 'close', 'volume',
            'ema10', 'sma20', 'sma50', 'sma200', 'adx', 'di+', 'di-',
            'symbol', 'tf'
        ]
        for col in required_columns:
            self.assertIn(col, result.columns)
        
        # Check data types
        self.assertTrue(pd.api.types.is_datetime64_any_dtype(result['timestamp']))
        self.assertEqual(result['symbol'].iloc[0], "BTC/USDT")
        self.assertEqual(result['tf'].iloc[0], "1d")
    
    def test_process_data_empty_input(self):
        """Test data processing with empty input."""
        with self.assertRaises(ValueError):
            _process_data([], "BTC/USDT", "1d")
    
    def test_create_embedding(self):
        """Test embedding creation function."""
        # Create a larger dataset for embedding
        large_df = pd.DataFrame({
            'open': np.random.uniform(50000, 51000, 50),
            'high': np.random.uniform(51000, 52000, 50),
            'low': np.random.uniform(49000, 50000, 50),
            'close': np.random.uniform(50000, 51000, 50),
            'volume': np.random.uniform(100, 1000, 50),
            'ema10': np.random.uniform(50000, 51000, 50),
            'sma20': np.random.uniform(50000, 51000, 50),
            'sma50': np.random.uniform(50000, 51000, 50),
            'sma200': np.random.uniform(50000, 51000, 50),
            'adx': np.random.uniform(20, 40, 50),
            'di+': np.random.uniform(25, 45, 50),
            'di-': np.random.uniform(15, 35, 50),
            'symbol': ['BTC/USDT'] * 50,
            'tf': ['1d'] * 50
        })
        
        window = 30
        result = _create_embedding(large_df, window)
        
        # Check result structure
        self.assertIsInstance(result, pd.DataFrame)
        self.assertEqual(len(result), window)
        
        # Check normalization (values should be between 0 and 1)
        numeric_cols = ['open', 'high', 'low', 'close', 'volume', 'ema10', 'sma20', 'sma50', 'sma200', 'adx', 'di+', 'di-', 'position']
        for col in numeric_cols:
            if col in result.columns:
                self.assertTrue((result[col] >= 0).all())
                self.assertTrue((result[col] <= 1).all())
    
    def test_create_embedding_missing_columns(self):
        """Test embedding creation with missing columns."""
        incomplete_df = pd.DataFrame({
            'open': [50000, 50100],
            'high': [50200, 50300],
            'low': [49900, 50050],
            'close': [50100, 50200],
            'volume': [100, 150]
        })
        
        with self.assertRaises(ValueError):
            _create_embedding(incomplete_df, window=2)
    
    def test_select_ohlcv_data_valid_timeframes(self):
        """Test OHLCV data selection for valid timeframes."""
        # Mock global variables
        with patch('services.ccxt_service.ohlcv_data_1d', {'BTC/USDT': self.mock_df}):
            with patch('services.ccxt_service.ohlcv_data_4h', {'ETH/USDT': self.mock_df}):
                result_1d = _select_ohlcv_data("1d")
                result_4h = _select_ohlcv_data("4h")
                
                self.assertEqual(result_1d, {'BTC/USDT': self.mock_df})
                self.assertEqual(result_4h, {'ETH/USDT': self.mock_df})
    
    def test_select_ohlcv_data_invalid_timeframe(self):
        """Test OHLCV data selection for invalid timeframe."""
        with self.assertRaises(ValueError):
            _select_ohlcv_data("invalid")
    
    def test_task_index(self):
        """Test task indexing function."""
        with patch('services.ccxt_service.ohlcv_data_1d', {'BTC/USDT': self.mock_df}):
            result = _task_index("1d", "BTC/USDT", window=30)
            
            self.assertIsInstance(result, dict)
            self.assertIn("BTC/USDT", result)
            self.assertIsInstance(result["BTC/USDT"], np.ndarray)
    
    def test_get_nearest_vector(self):
        """Test nearest vector search function."""
        # Create mock index and symbols
        mock_index = Mock()
        mock_index.search.return_value = (np.array([[0.1, 0.2, 0.3]]), np.array([[0, 1, 2]]))
        
        symbols = ["BTC/USDT", "ETH/USDT", "ADA/USDT"]
        query_embed = np.random.random(390)  # 13 features * 30 window
        
        result = _get_nearest_vector(mock_index, symbols, query_embed, k=3)
        
        self.assertIsInstance(result, list)
        self.assertEqual(len(result), 3)
        self.assertIsInstance(result[0], tuple)
        self.assertEqual(len(result[0]), 2)
    
    @patch('services.ccxt_service._select_ohlcv_data')
    @patch('services.ccxt_service._index_matrix')
    @patch('services.ccxt_service._create_embedding')
    @patch('services.ccxt_service._get_nearest_vector')
    async def test_get_similar_ohlcv(self, mock_get_nearest, mock_create_embed, mock_index_matrix, mock_select_data):
        """Test get similar OHLCV function."""
        # Mock return values
        mock_select_data.return_value = {'BTC/USDT': self.mock_df}
        mock_index_matrix.return_value = (Mock(), ['BTC/USDT', 'ETH/USDT'])
        mock_create_embed.return_value = pd.DataFrame()
        mock_get_nearest.return_value = [('ETH/USDT', 0.1), ('ADA/USDT', 0.2)]
        
        result = await get_similar_ohlcv("BTC", "1d", k=2, window=30)
        
        self.assertIsInstance(result, list)
        self.assertEqual(len(result), 2)
        self.assertIn('symbol', result[0])
        self.assertIn('distance', result[0])
    
    @patch('ccxt.async_support.binance')
    @patch('ccxt.async_support.gateio')
    @patch('ccxt.async_support.mexc')
    async def test_get_ccxt_ohlcv_success(self, mock_mexc, mock_gateio, mock_binance):
        """Test successful OHLCV data fetching."""
        # Mock exchange responses
        mock_binance_instance = AsyncMock()
        mock_binance_instance.fetch_ohlcv.return_value = self.mock_ohlcv
        mock_binance_instance.close = AsyncMock()
        mock_binance.return_value = mock_binance_instance
        
        mock_gateio_instance = AsyncMock()
        mock_gateio_instance.fetch_ohlcv.return_value = None
        mock_gateio_instance.close = AsyncMock()
        mock_gateio.return_value = mock_gateio_instance
        
        mock_mexc_instance = AsyncMock()
        mock_mexc_instance.fetch_ohlcv.return_value = None
        mock_mexc_instance.close = AsyncMock()
        mock_mexc.return_value = mock_mexc_instance
        
        result = await get_ccxt_ohlcv("BTC/USDT", "1d", 1640995200000, 10)
        
        self.assertIsInstance(result, pd.DataFrame)
        self.assertEqual(len(result), 3)
        self.assertListEqual(list(result.columns), ['timestamp', 'open', 'high', 'low', 'close', 'volume'])
    
    @patch('ccxt.async_support.binance')
    @patch('ccxt.async_support.gateio')
    @patch('ccxt.async_support.mexc')
    async def test_get_ccxt_ohlcv_all_fail(self, mock_mexc, mock_gateio, mock_binance):
        """Test OHLCV data fetching when all exchanges fail."""
        # Mock all exchanges to return None
        for mock_exchange in [mock_binance, mock_gateio, mock_mexc]:
            mock_instance = AsyncMock()
            mock_instance.fetch_ohlcv.return_value = None
            mock_instance.close = AsyncMock()
            mock_exchange.return_value = mock_instance
        
        with self.assertRaises(Exception):
            await get_ccxt_ohlcv("BTC/USDT", "1d", 1640995200000, 10)
    
    @patch('services.ccxt_service._select_ohlcv_data')
    async def test_get_ccxt_ohlcv_batch(self, mock_select_data):
        """Test batch OHLCV data retrieval."""
        mock_select_data.return_value = {'BTC/USDT': self.mock_df}
        
        result = await get_ccxt_ohlcv_batch("1d", "BTC/USDT")
        
        self.assertIsInstance(result, pd.DataFrame)
        self.assertEqual(len(result), 3)


class TestCcxtServiceIntegration(unittest.TestCase):
    """Integration tests for ccxt_service module."""
    
    def setUp(self):
        """Set up test fixtures."""
        self.test_data = pd.DataFrame({
            'timestamp': pd.to_datetime([1640995200000, 1640995260000, 1640995320000], unit='ms'),
            'open': [50000, 50100, 50200],
            'high': [50200, 50300, 50400],
            'low': [49900, 50050, 50100],
            'close': [50100, 50200, 50300],
            'volume': [100, 150, 200],
            'ema10': [50100, 50150, 50200],
            'sma20': [50050, 50100, 50150],
            'sma50': [50000, 50050, 50100],
            'sma200': [49950, 50000, 50050],
            'adx': [25.5, 26.0, 26.5],
            'di+': [30.0, 31.0, 32.0],
            'di-': [20.0, 21.0, 22.0],
            'symbol': ['BTC/USDT', 'BTC/USDT', 'BTC/USDT'],
            'tf': ['1d', '1d', '1d']
        })
    
    def test_full_data_pipeline(self):
        """Test the complete data processing pipeline."""
        # Step 1: Process raw OHLCV data
        raw_ohlcv = [
            [1640995200000, 50000, 50200, 49900, 50100, 100],
            [1640995260000, 50100, 50300, 50050, 50200, 150],
            [1640995320000, 50200, 50400, 50100, 50300, 200],
        ]
        
        processed_df = _process_data(raw_ohlcv, "BTC/USDT", "1d")
        
        # Step 2: Create embedding
        embedding = _create_embedding(processed_df, window=3)
        
        # Step 3: Verify results
        self.assertIsInstance(processed_df, pd.DataFrame)
        self.assertIsInstance(embedding, pd.DataFrame)
        self.assertEqual(len(embedding), 3)
        
        # Check that embedding is normalized
        numeric_cols = ['open', 'high', 'low', 'close', 'volume', 'ema10', 'sma20', 'sma50', 'sma200', 'adx', 'di+', 'di-', 'position']
        for col in numeric_cols:
            if col in embedding.columns:
                self.assertTrue((embedding[col] >= 0).all())
                self.assertTrue((embedding[col] <= 1).all())


if __name__ == '__main__':
    unittest.main()
