import os
from pathlib import Path
import MetaTrader5 as mt5
import time
from datetime import datetime
import pandas as pd
import json
import logging
from ...exchange.base import Adapter
class MT5(Adapter):
    def __init__(self, connection,symbol,tf):
        self.connection =connection
        self.symbol = symbol
        self.tf = tf
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
                # create bot crypto
                #     connect exchange
        # DIR = Path(__file__).parent.parent.parent
        # logging.basicConfig(filename=os.path.join(DIR, 'bot.log'),level=logging.DEBUG,format='%(asctime)s %(message)s', datefmt='%m/%d/%Y %I:%M:%S %p')
    def connection_exchange(self):    
        init = mt5.initialize(
          login =self.connection["login"],             #Aount number
          password =self.connection["password"],     # password
          server = self.connection["server"],          # server name as it is specified in the terminal
          timeout= 60,         # timeout 60s
          )
        if init :
            logging.info(f"connect mt5 succesful {self.symbol} {self.tf}")   
        else:
            logging.info(f"connect mt5 error {mt5.last_error()}")    
    def tf_mt5(self):
        match self.tf:
            case "1m": return 1
            case "5m": return 5
            case "15m": return 15
            case "1h": return  1  | 0x4000
            case "4h": return  4  | 0x4000
            case "1d": return 24 | 0x4000
            case "1w": return 1  | 0x8000
            case "1M" :return 1  | 0xC000
            case    _: return 1         
    def info(self):
        print(mt5.account_info())
    def tf_div(self):
        delta =1
        match self.tf:
            case "1s": return 1*delta
            case "1m": return 60*delta
            case "5m": return 5*60*delta
            case "15m": return 15*60*delta
            case "1h": return  60*60*delta
            case "4h": return 4*60*60*delta
            case "1d": return 24*60*60*delta  # 86400000
            case "1w": return 7*24*60*60*delta
            case    _: return 1*delta      
    def format_data(self,data):
        data.columns =["Datetime","Open","High","Low","Close","TickVolume","Spread","Volume"]
        data.Datetime=  pd.to_datetime(data.Datetime,unit ="s")  
        return data
    def get_OHLCV_from_date(self,date_from :datetime,buffer):
        return mt5.copy_rates_from(self.symbol,self.tf_mt5(), date_from,buffer)                
    def get_OHLCV_current(self,buffer):
        return mt5.copy_rates_from_pos(self.symbol,self.tf_mt5(),0,buffer)               
    def simulate_new_ticket(self):
        self.simulate_ticket =self.simulate_ticket +1
        return self.simulate_ticket
    
    def get_trades(self,start,end):
        if self.mode =="live":
            #order
            deals =mt5.history_deals_get(start,end,group ="*USD*")
            
            #deals =mt5.history_deals_get(date_from=start,date_end=end)
            # if deals==None:
            #     print("No deals with group=\"*USD*\", error code={}".format(mt5.last_error()))
            # elif len(deals)> 0:
            #     print("history_deals_get({}, {}, group=\"*BTC*\")={}".format(start,end,len(deals)))
            df_deals=  pd.DataFrame(  list(deals),columns=deals[0]._asdict().keys())
            
            df_deals["type"] = df_deals.apply(lambda row: cn.get_mt5_position_name(row["type"]), axis = 1)
            #self.deals["entry"] = self.deals.apply(lambda row: cn.get_mt5_order_name(row["entry"]), axis = 1)
            df_deals['time'] = pd.to_datetime( df_deals['time'], unit='s') 
            data1 = pd.DataFrame(df_deals.loc[(df_deals["entry"] ==0)])
            #print(data1)
            data2 =pd.DataFrame(df_deals.loc[(df_deals["entry"] ==1)])
            trades =pd.DataFrame(data1.merge(data2,on="position_id",how ="left"))
            print (trades)
            trades["symbol"] = trades["symbol_x"]
            trades["type"] = trades["type_x"]
            trades["position_id"] =trades["position_id"]
            trades["time_in"] =trades["time_x"]
            trades["time_out"] =trades["time_y"]
            trades["duration"] =trades["time_y"]-trades["time_x"]
            trades["price_in"] =trades["price_x"]
            trades["price_out"] =trades["price_y"]
            trades["volume"] =trades["volume_y"]
            trades["profit"] = trades["profit_y"]
            self.trades=trades.groupby(["position_id","symbol","type","time_in","time_out","duration","price_in","price_out"],group_keys=  False).agg({"volume":"sum","profit":"sum"})
            self.trades_sum=trades.groupby(["symbol","type"],group_keys=  False).agg({"position_id":"count","duration":"sum","volume":"sum","profit":"sum"})
            #print(self.trades_sum)
           
            #self.deals_sum = self.deals.groupby(["position_id","type","entry","symbol"]).agg({"volume" : "sum" ,"price" :"mean" ,"profit":"sum"})
            #get deal
            #get trade  = join 2 tabel deal ,entry0  as start,entry1 as end
    def get_market(self):
        self.market = mt5.symbol_info(self.symbol)
        self.ticker= mt5.symbol_info_tick(self.symbol)
    def update_market(self):
        self.lastestBar =self.df.tail(1)
        #print(self.lastestBar )
        lastest_price =self.lastestBar.iloc[0]["Close"]
        #print("last price",lastest_price )
        if self.mode =="live":
            #self.market = mt5.symbol_info(self.symbol)
            self.market = mt5.symbol_info(self.symbol)
            self.ticker= mt5.symbol_info_tick(self.symbol)
            date_from = int( datetime.now().timestamp()) - self.tf_div()
            
            #order,postiion list
            orders =mt5.orders_get(symbol=self.symbol)
            if len(self.orders)>0:
                self.orders=  pd.DataFrame(  list(orders),columns=orders[0]._asdict().keys())     
                self.orders['time_setup'] = pd.to_datetime(self.orders['time_setup'], unit='s')
                self.orders.drop(['time_done', 'time_done_msc', 'position_id', 'position_by_id', 'reason', 'volume_initial', 'price_stoplimit'], axis=1, inplace=True)
            #self.orders["type"] =  self.orders.apply(lambda row: cn.get_mt5_order_name(row["type"]), axis = 1)
            if len(self.positions)>0:
                positions = mt5.positions_get(symbol=self.symbol)
                self.positions= pd.DataFrame(list(positions),columns=positions[0]._asdict().keys()) 
                self.positions['time'] = pd.to_datetime(self.positions['time'], unit='s')
                #self.positions["type"] = self.positions.apply(lambda row: cn.get_mt5_position_name(row["type"]), axis = 1)
                self.positions.drop(['time_update', 'time_msc', 'time_update_msc', 'external_id'], axis=1, inplace=True)
        if self.mode =="backtest": 
            
            # deal order
            #for i in self.orders : # loop on list
            if len(self.orders)>0:
                for index, i in self.orders.iterrows() : # loop on dataframe
                    fill_order = False
                    fill_order_type = 0
                    fill_type_position = 0
                    match i["type"] :
                        # BUY MARKET"
                        case 0 : 
                            fill_order = True
                            fill_type_position = 0
                        # SELL_MARKET
                        case 1 : 
                            fill_order = True
                            fill_type_position = 1
                        # BUY_LIMIT"
                        case 2 : 
                            fill_order =  self.lastestBar["Close"] <= i["price"]
                            fill_type_position = 0
                        # SELL_LIMIT
                        case 3 : 
                            fill_order =  self.lastestBar["Close"] >= i["price"]
                            fill_type_position = 1
                        # BUY_STOP"
                        case 4 : 
                            fill_order =  self.lastestBar["Close"] >= i["price"]
                            fill_type_position = 0
                        # SELL_STOP
                        case 5 : 
                            fill_order =  self.lastestBar["Close"] <= i["price"]
                            fill_type_position = 1
                        # BUY_STOP_LIMIT"
                        case 6 : 
                            fill_order =  self.lastestBar["Close"] >= i["price"]
                            fill_order_type  = 0
                        # SELL_STOP_LIMIT
                        case 7 : 
                            fill_order =  self.lastestBar["Close"] <= i["price"]
                            fill_order_type  = 1
                    #add to position
                    if fill_order :
                        #print ("simulate deal order",i["ticket"],"type",i["type"] )
                        if i["type"] < 6 :
                          
                            position = {
                                        "time"   : self.lastestBar.iloc[0]["Datetime"],
                                        "ticket" : i["ticket"],
                                        "symbol" : self.symbol,
                                        "type"   : fill_type_position,
                                        "volume" : i["volume_current"],
                                        "price_open" :i["price_open"],
                                        "price_current" : lastest_price,
                                        "sl": i["sl"], 
                                        "tp": i["tp"], 
                                        "profit" : 0,
                                        }
                            #print(position)
                            if len(self.positions) == 0:
                                self.positions =pd.DataFrame(position , index=[0],columns =position.keys())
                            else :
                                self.positions.loc[len(self.positions)] = position
                            #clear order
                            self.orders.drop(index = index)     
                        if i["type"] == 6 :
                            #change order
                            i["type"] = 4
                            i["price"] = i["stoplimit"]
                            i["stoplimit"] =0
                        if i["type"] ==7 :  
                            #change order
                            i["type"] = 5
                            i["price"] = i["stoplimit"]
                            i["stoplimit"] =0

            #update positions 
            if len(self.positions)>0:                  
                self.positions["price_current"] = lastest_price
                self.positions.loc[self.positions["type"] == 0,"profit"] =(self.positions["price_current"] - self.positions["price_open"] ) * self.positions["volume"]     
                self.positions.loc[self.positions["type"] == 1, "profit"] =( self.positions["price_open"] -self.positions["price_current"]  ) * self.positions["volume"]             
                
            #     #self.positions["profit"] = (self.positions["price_current"] - self.positions["price_open"] ) * self.positions["volume"]
      
            #     for index, i in self.positions.iterrows() :
            #         i["price_current"] = lastest_price
            #         #lastest_price =self.lastestBar["Datetime"] 
            #         #print("calcuate profit",(lastest_price - i["price_open"] ) * i["volume"])
            #         if i["type"] == mt5.POSITION_TYPE_BUY : # BUY
            #             i["profit"] = (i["price_current"] - i["price_open"] ) * i["volume"]

            #         else : #SELL
            #             i["profit"] = (i["price_open"] -i["price_current"]  )  * i["volume"]
            #         #print("calcuate profit",i["profit"] )
             
        #sumary order,postiion
        if len(self.orders)>0:
            self.orders_sum = self.orders.groupby(["type"]).agg({"volume_current" : "sum" ,"price_open" :"mean"})
        if len(self.positions)>0:
            self.positions_sum=self.positions.groupby(["type"]).agg({"volume":"sum","price_open":"mean","profit":"sum"})
    def close_positions_by_type(self,type):  
        for index,i in self.positions.iterrows() :
            if i["type"] == type:
                self.close_position(i["ticket"]) 
     
    def close_position(self,ticket):    
        if self.mode =="live":   
            mt5.Close(symbol= self.symbol,ticket =ticket)   
        if self.mode == "backtest" :
            position = self.positions[self.positions["ticket"] == ticket][0]
            self.positions.drop(index=position.index )
            #add trade
            trade = {
            "time_in"   : position["time"],
            "time_out"   : self.lastestBar.iloc[0]["Datetime"],
            "symbol" : position["symbol"],
            "ticket" : ticket,
            "type"   : position["type"],
            "volume" : position["volume"],
            "price_open" :position["price_in"],
            "price_current" :position["price_out"],
            "duration" :self.lastestBar.iloc[0]["Datetime"]-position["time"],
            "sl": position["sl"], 
            "tp": position["tp"], 
            "profit" : position["profit"],
            }
            #print(position)
            if len(self.trades) == 0:
                self.trades =pd.DataFrame(trade , index=[0],columns =trade.keys())
            else :
                self.trades.loc[len(self.trades)] = trade
    def modify_position(self,ticket,sl,tp):
        if self.mode =="live":      
            request = { 
     
                "action": mt5.TRADE_ACTION_SLTP,
                "position" : ticket,
                 "tp": tp,
                 "sl" :sl

            }
            result = mt5.order_send(request)
            if result.retcode != mt5.TRADE_ACTION_SLTP:
                print("Order failed: {}".format(result.retcode)) 
            else: 
                print(result.order)      
        if self.mode == "backtest" :
            position = self.positions[self.positions["ticket"] == ticket][0]
            position["sl"] =sl
            position["tp"] =tp
    def close_orders_by_type(self,type):  
        for index,i in self.orders.iterrows() :
            order_type = i["type"]
            if type== 0 and (order_type == 0 or order_type == 2 or order_type == 4 or order_type == 6) :
                self.close_order(i["ticket"])      
            if type== 1 and (order_type == 1 or order_type == 3 or order_type == 5 or order_type == 7) :
                self.close_order(i["ticket"])                                
    def close_order(self,ticket):
        if self.mode =="live":
           
            point = mt5.symbol_info(self.symbol).point
            ask = mt5.symbol_info_tick(self.symbol).ask
            bid = mt5.symbol_info_tick(self.symbol).bid
            #deviation = 20
            deviation = int( 2*(ask-bid))

            request = { 
                "action": mt5.TRADE_ACTION_REMOVE,
                "order" : ticket

            }
            #result ={}
            print (request)
            #result = mt5.order_send(request=request) #no work
            result = mt5.order_send(request)
            print (result)
            if result.retcode != mt5.TRADE_RETCODE_DONE:
                print("Order failed: {}".format(result.retcode)) 
            else: 
                print(result.order)   
        if self.mode == "backtest" :
            order = self.orders[ self.orders["ticket"] == ticket][0]
            self.orders.drop(index=order.index )          
    def modify_order(self,ticket,sl,tp):
        if self.mode =="live":

            request = { 
                "action": mt5.TRADE_ACTION_MODIFY,
                "order" : ticket,
                "tp": tp,
                "sl" :sl

            }
            #result ={}
            print (request)
            #result = mt5.order_send(request=request) #no work
            result = mt5.order_send(request)
            print (result)
            if result.retcode != mt5.TRADE_RETCODE_DONE:
                print("Order failed: {}".format(result.retcode)) 
            else: 
                print(result.order)   
        if self.mode == "backtest" :
            order = self.orders[ self.orders["ticket"] == ticket][0]
            order["sl"] =sl
            order["tp"] =tp       
                    
    def creat_order(self,order_type,lot,price,price_limit=0,sl=0,tp=0,comment=""):
        if self.mode =="live":
            point = mt5.symbol_info(self.symbol).point
            ask = mt5.symbol_info_tick(self.symbol).ask
            bid = mt5.symbol_info_tick(self.symbol).bid
            #deviation = 20
            deviation = int( 2*(ask-bid))
            if order_type <=1 :
               # market order
               action = mt5.TRADE_ACTION_DEAL
            else :
              # pending order
                action = mt5.TRADE_ACTION_PENDING
            request = { 
                "action": action,
                "symbol": self.symbol , 
                "type": order_type,
                "volume": lot, 
                "price": price, 
                "stoplimit" : price_limit,
                "sl": sl, 
                "tp": tp, 
                "magic": 1,
                "deviation": deviation, 
                "type_time": mt5.ORDER_TIME_GTC, 
                "type_filling": mt5.ORDER_FILLING_IOC,
                "comment" : comment
                

            }
            #result ={}
            print (request)
            #result = mt5.order_send(request=request) #no work
            result = mt5.order_send(request)
            print (result)
            if result.retcode != mt5.TRADE_RETCODE_DONE:
                print("Order failed: {}".format(result.retcode)) 
            else: 
                print(result.order)  
        if self.mode =="backtest":
            point = mt5.symbol_info(self.symbol).point
            ask = mt5.symbol_info_tick(self.symbol).ask
            bid = mt5.symbol_info_tick(self.symbol).bid
            #deviation = 20
            deviation = int( 2*(ask-bid))
            if order_type <=1 :
               # market order
               action = mt5.TRADE_ACTION_DEAL
            else :
              # pending order
                action = mt5.TRADE_ACTION_PENDING
            order = { 
                "time_setup": self.lastestBar["Datetime"],
                "ticket" : self.simulate_new_ticket(),
                "symbol": self.symbol , 
                "volume_current": lot, 
                "type": order_type,
                "price_open": price, 
                "stoplimit" : price_limit,
                "sl": sl, 
                "tp": tp,
                "comment" : comment
                # "magic": 1,
                # "deviation": deviation, 
                # "type_time": mt5.ORDER_TIME_GTC, 
                # "type_filling": mt5.ORDER_FILLING_IOC,
                # 
            }
            if len(self.orders) ==0 :
                self.orders =pd.DataFrame(order , index=[0],columns =order.keys())
            else:     
                self.orders.loc[len(self.orders)] = order
            #            

if __name__ =='__main__':
    connection = {
    "server": "Exness-MT5Trial14",
    "login": 244358935,
    "password": "Abc13579@",
}
    symbol = "BTCUSDm"
    tf = "H1"
    init = mt5.initialize(
          login =connection["login"],             #Aount number
          password =connection["password"],     # password
          server = connection["server"],          # server name as it is specified in the terminal
          timeout= 60,         # timeout 60s
          )
    if init :
        logging.info(f"connect mt5 succesful {symbol} {tf}")   
    else:
        logging.info(f"connect mt5 error {mt5.last_error()}")    