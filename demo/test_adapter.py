# import sys
# import os

# # Add the project root to the Python path
# sys.path.append(os.path.abspath(os.path.dirname(__file__)))
from core.exchange.adapter.mt5_adapter import MT5

connection = {
    "server": "Exness-MT5Trial14",
    "login": 244358935,
    "password": "Abc13579@",
}
exchange = MT5(connection=connection, symbol="BTCUSDm", tf="H1")
print(exchange.info())
