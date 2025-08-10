import unittest
import json
from unittest.mock import Mock, patch
import sys
import os

# Add core directory to path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..', 'core'))

from exchange.base import Adapter


class TestAdapter(unittest.TestCase):
    """Unit tests for the base Adapter class."""
    
    def setUp(self):
        """Set up test fixtures before each test method."""
        self.exchange_name = "test_exchange"
        self.adapter = Adapter(self.exchange_name)
    
    def test_init(self):
        """Test adapter initialization."""
        self.assertEqual(self.adapter.exchange, self.exchange_name)
        self.assertIsNone(self.adapter.symbol)
        self.assertIsNone(self.adapter.tf)
        self.assertEqual(self.adapter.market, [])
        self.assertEqual(self.adapter.lastestBar, {})
        self.assertEqual(self.adapter.ticker, [])
        self.assertEqual(self.adapter.orders, [])
        self.assertEqual(self.adapter.orders_sum, [])
        self.assertEqual(self.adapter.positions, [])
        self.assertEqual(self.adapter.positions_sum, [])
        self.assertEqual(self.adapter.trades, [])
        self.assertEqual(self.adapter.trades_sum, [])
        self.assertEqual(self.adapter.simulate_ticket, 0)
    
    def test_connection_exchange_abstract_method(self):
        """Test that connection_exchange is an abstract method."""
        with self.assertRaises(NotImplementedError):
            self.adapter.connection_exchange()
    
    def test_tf_parse_abstract_method(self):
        """Test that tf_parse is an abstract method."""
        with self.assertRaises(NotImplementedError):
            self.adapter.tf_parse()
    
    def test_set_symbol(self):
        """Test setting symbol property."""
        test_symbol = "BTC/USDT"
        self.adapter.symbol = test_symbol
        self.assertEqual(self.adapter.symbol, test_symbol)
    
    def test_set_timeframe(self):
        """Test setting timeframe property."""
        test_tf = "1h"
        self.adapter.tf = test_tf
        self.assertEqual(self.adapter.tf, test_tf)
    
    def test_add_market_data(self):
        """Test adding market data."""
        market_data = {"price": 50000, "volume": 100}
        self.adapter.market.append(market_data)
        self.assertIn(market_data, self.adapter.market)
        self.assertEqual(len(self.adapter.market), 1)
    
    def test_add_order(self):
        """Test adding order data."""
        order_data = {"symbol": "BTC/USDT", "side": "buy", "amount": 0.1}
        self.adapter.orders.append(order_data)
        self.assertIn(order_data, self.adapter.orders)
        self.assertEqual(len(self.adapter.orders), 1)
    
    def test_add_position(self):
        """Test adding position data."""
        position_data = {"symbol": "BTC/USDT", "size": 0.5}
        self.adapter.positions.append(position_data)
        self.assertIn(position_data, self.adapter.positions)
        self.assertEqual(len(self.adapter.positions), 1)
    
    def test_increment_simulate_ticket(self):
        """Test incrementing simulate ticket."""
        initial_ticket = self.adapter.simulate_ticket
        self.adapter.simulate_ticket += 1
        self.assertEqual(self.adapter.simulate_ticket, initial_ticket + 1)
    
    def test_dataclass_attributes(self):
        """Test that all dataclass attributes are properly defined."""
        expected_attributes = [
            'exchange', 'tf', 'connection', 'ticker', 'orders', 
            'orders_sum', 'positions', 'positions_sum', 'simulate_ticket'
        ]
        
        for attr in expected_attributes:
            self.assertTrue(hasattr(self.adapter, attr), 
                          f"Adapter should have attribute: {attr}")


class TestAdapterIntegration(unittest.TestCase):
    """Integration tests for Adapter class."""
    
    def setUp(self):
        """Set up test fixtures."""
        self.adapter = Adapter("binance")
    
    def test_full_workflow(self):
        """Test a complete workflow scenario."""
        # Set up trading parameters
        self.adapter.symbol = "BTC/USDT"
        self.adapter.tf = "1h"
        
        # Add market data
        market_data = {"timestamp": 1234567890, "price": 50000}
        self.adapter.market.append(market_data)
        
        # Add order
        order = {"symbol": "BTC/USDT", "side": "buy", "amount": 0.1, "price": 50000}
        self.adapter.orders.append(order)
        
        # Add position
        position = {"symbol": "BTC/USDT", "size": 0.1, "entry_price": 50000}
        self.adapter.positions.append(position)
        
        # Verify state
        self.assertEqual(self.adapter.symbol, "BTC/USDT")
        self.assertEqual(self.adapter.tf, "1h")
        self.assertEqual(len(self.adapter.market), 1)
        self.assertEqual(len(self.adapter.orders), 1)
        self.assertEqual(len(self.adapter.positions), 1)
        self.assertEqual(self.adapter.market[0]["price"], 50000)
        self.assertEqual(self.adapter.orders[0]["side"], "buy")
        self.assertEqual(self.adapter.positions[0]["size"], 0.1)


if __name__ == '__main__':
    unittest.main()
