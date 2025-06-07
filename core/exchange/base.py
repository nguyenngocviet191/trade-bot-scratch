
import json
from dataclasses import dataclass

@dataclass(init=False)
class Adapter:
    """
    Base class for exchange adapters.
    """
    exchange : str
    tf : str
    connection : json
    ticker : str
    orders: list[float]
    orders_sum : list[float]
    positions: list[float]
    positions_sum : list[float]
    simulate_ticket : int =0
    def __init__(self, exchange):
        self.exchange = exchange
        self.symbol = None
        self.tf = None
        self.market =[]
        self.lastestBar ={}
        self.ticker =[]
        self.orders =[]
        self.orders_sum  =[]     
        self.positions =[]
        self.positions_sum =[]
        self.trades =[]
        self.trades_sum =[]
        self.simulate_ticket = 0
    def connection_exchange(self):
        pass
    def tf_parse(self):
        pass
        