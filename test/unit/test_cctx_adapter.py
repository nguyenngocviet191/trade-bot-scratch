import unittest
import pandas as pd
import numpy as np
from unittest.mock import Mock, patch, MagicMock
import sys
import os
from datetime import datetime

# Add core directory to path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..', 'core'))

from exchange.adapter.cctx_adapter import Cctx_adapt


class TestCctxAdapt(unittest.TestCase):
    """Unit tests for the Cctx_adapt class."""
    
    def setUp(self):
        """Set up test fixtures before each test method."""
        self.connection = {
            "exchange": "binance",
            "type": "demo",
            "api_key": "test_api_key",
            "secret_key": "test_secret_key"
        }
        self.symbol = "BTC/USDT"
        self.tf = "1h"
        self.adapter = Cctx_adapt(self.connection, self.symbol, self.tf)
    
    def test_init(self):
        """Test adapter initialization."""
        self.assertEqual(self.adapter.connection, self.connection)
        self.assertEqual(self.adapter.symbol, self.symbol)
        self.assertEqual(self.adapter.tf, self.tf)
        self.assertEqual(self.adapter.unit, "h")
        self.assertEqual(self.adapter.df, [])
        self.assertEqual(self.adapter.df2, [])
        self.assertEqual(self.adapter.market, [])
        self.assertEqual(self.adapter.tickers, [])
        self.assertEqual(self.adapter.order_list, [])
        self.assertEqual(self.adapter.orderFilled_list, [])
        self.assertEqual(self.adapter.position, 0)
        self.assertEqual(self.adapter.avgEntry, 0)
        self.assertEqual(self.adapter.mode, "live")
    
    def test_tf_div_valid_timeframes(self):
        """Test timeframe division for valid timeframes."""
        test_cases = [
            ("1s", 1000),
            ("1m", 60000),
            ("5m", 300000),
            ("15m", 900000),
            ("1h", 3600000),
            ("4h", 14400000),
            ("1d", 86400000),
            ("1w", 604800000)
        ]
        
        for tf, expected in test_cases:
            with self.subTest(tf=tf):
                self.adapter.tf = tf
                result = self.adapter.tf_div()
                self.assertEqual(result, expected)
    
    def test_tf_div_invalid_timeframe(self):
        """Test timeframe division for invalid timeframe."""
        self.adapter.tf = "invalid"
        result = self.adapter.tf_div()
        self.assertEqual(result, 1000)  # Default to 1s
    
    def test_format_data(self):
        """Test data formatting."""
        # Create test data
        test_data = pd.DataFrame({
            'Datetime': [1640995200000, 1640995260000],  # Unix timestamps in ms
            'Open': [50000, 50100],
            'High': [50200, 50300],
            'Low': [49900, 50050],
            'Close': [50100, 50200],
            'Volume': [100, 150]
        })
        
        result = self.adapter.format_data(test_data)
        
        # Check column names
        expected_columns = ["Datetime", "Open", "High", "Low", "Close", "Volume"]
        self.assertListEqual(list(result.columns), expected_columns)
        
        # Check datetime conversion
        self.assertTrue(pd.api.types.is_datetime64_any_dtype(result['Datetime']))
    
    @patch('ccxt.binance')
    def test_connection_binance(self, mock_binance):
        """Test connection to Binance exchange."""
        mock_exchange = Mock()
        mock_binance.return_value = mock_exchange
        
        self.adapter.connection()
        
        # Verify exchange was created
        mock_binance.assert_called_once()
        
        # Verify sandbox mode for demo
        mock_exchange.set_sandbox_mode.assert_called_once_with(True)
        
        # Verify API keys were set
        self.assertEqual(mock_exchange.apiKey, "test_api_key")
        self.assertEqual(mock_exchange.secret, "test_secret_key")
    
    def test_create_order_backtest_mode(self):
        """Test order creation in backtest mode."""
        self.adapter.mode = "backtest"
        
        # Test creating first order
        self.adapter.create_order("market", "buy", 0.1, 50000)
        
        self.assertEqual(len(self.adapter.order_list), 1)
        order = self.adapter.order_list.iloc[0]
        self.assertEqual(order["Symbol"], "BTC/USDT")
        self.assertEqual(order["Type"], "market")
        self.assertEqual(order["Side"], "buy")
        self.assertEqual(order["Amount"], 0.1)
        self.assertEqual(order["Price"], 50000)
        
        # Test creating second order
        self.adapter.create_order("limit", "sell", 0.05, 51000)
        self.assertEqual(len(self.adapter.order_list), 2)
    
    def test_simulate_market_market_order_fill(self):
        """Test market order filling in simulation."""
        self.adapter.mode = "backtest"
        
        # Create a market order
        self.adapter.create_order("market", "buy", 0.1, 50000)
        
        # Simulate market data
        market_data = {
            "Open": 50000,
            "High": 50200,
            "Low": 49900,
            "Close": 50100,
            "Volume": 100
        }
        
        self.adapter.simulate_market(market_data)
        
        # Order should be filled and moved to filled list
        self.assertEqual(len(self.adapter.order_list), 0)
        self.assertEqual(len(self.adapter.orderFilled_list), 1)
        self.assertEqual(self.adapter.position, 0.1)
    
    def test_simulate_market_limit_order_fill(self):
        """Test limit order filling in simulation."""
        self.adapter.mode = "backtest"
        
        # Create a limit buy order
        self.adapter.create_order("limit", "buy", 0.1, 50000)
        
        # Simulate market data where price drops to trigger limit order
        market_data = {
            "Open": 50100,
            "High": 50200,
            "Low": 49900,  # Low price triggers limit order
            "Close": 50000,
            "Volume": 100
        }
        
        self.adapter.simulate_market(market_data)
        
        # Order should be filled
        self.assertEqual(len(self.adapter.order_list), 0)
        self.assertEqual(len(self.adapter.orderFilled_list), 1)
        self.assertEqual(self.adapter.position, 0.1)
    
    def test_simulate_market_limit_order_no_fill(self):
        """Test limit order not filling when conditions not met."""
        self.adapter.mode = "backtest"
        
        # Create a limit buy order
        self.adapter.create_order("limit", "buy", 0.1, 50000)
        
        # Simulate market data where price doesn't reach limit
        market_data = {
            "Open": 50100,
            "High": 50200,
            "Low": 50050,  # Price doesn't reach limit
            "Close": 50100,
            "Volume": 100
        }
        
        self.adapter.simulate_market(market_data)
        
        # Order should remain unfilled
        self.assertEqual(len(self.adapter.order_list), 1)
        self.assertEqual(len(self.adapter.orderFilled_list), 0)
        self.assertEqual(self.adapter.position, 0)
    
    def test_profit_calculation(self):
        """Test profit calculation for filled orders."""
        self.adapter.mode = "backtest"
        
        # Create and fill a buy order
        self.adapter.create_order("market", "buy", 0.1, 50000)
        market_data = {"Open": 50000, "High": 50200, "Low": 49900, "Close": 50100, "Volume": 100}
        self.adapter.simulate_market(market_data)
        
        # Check profit calculation
        filled_order = self.adapter.orderFilled_list.iloc[0]
        expected_profit = (50100 - 50000) * 0.1  # (Close - Entry) * Amount
        self.assertEqual(filled_order["Profit"], expected_profit)
    
    def test_info_method(self):
        """Test info method output."""
        with patch('builtins.print') as mock_print:
            self.adapter.info()
            mock_print.assert_called_once_with("CCTX ", self.adapter.exchange, self.adapter.symbol, self.adapter.tf)


class TestCctxAdaptIntegration(unittest.TestCase):
    """Integration tests for Cctx_adapt class."""
    
    def setUp(self):
        """Set up test fixtures."""
        self.connection = {
            "exchange": "binance",
            "type": "demo",
            "api_key": "test_api_key",
            "secret_key": "test_secret_key"
        }
        self.adapter = Cctx_adapt(self.connection, "BTC/USDT", "1h")
    
    def test_complete_trading_scenario(self):
        """Test a complete trading scenario."""
        self.adapter.mode = "backtest"
        
        # Step 1: Create multiple orders
        self.adapter.create_order("market", "buy", 0.1, 50000)
        self.adapter.create_order("limit", "sell", 0.05, 51000)
        self.adapter.create_order("limit", "buy", 0.2, 49000)
        
        self.assertEqual(len(self.adapter.order_list), 3)
        
        # Step 2: Simulate market movement
        market_data = {
            "Open": 50000,
            "High": 51100,  # Triggers sell limit
            "Low": 48900,   # Triggers buy limit
            "Close": 50500,
            "Volume": 100
        }
        
        self.adapter.simulate_market(market_data)
        
        # Step 3: Verify results
        # Market order should be filled
        # Sell limit should be filled (High > 51000)
        # Buy limit should be filled (Low < 49000)
        self.assertEqual(len(self.adapter.order_list), 0)  # All orders filled
        self.assertEqual(len(self.adapter.orderFilled_list), 3)
        
        # Calculate expected position: 0.1 (buy) - 0.05 (sell) + 0.2 (buy) = 0.25
        self.assertEqual(self.adapter.position, 0.25)


if __name__ == '__main__':
    unittest.main()
