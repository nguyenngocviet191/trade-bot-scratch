
import ccxt
import os
import MetaTrader5 as mt5
import time
from datetime import datetime
import pandas as pd
from dotenv import load_dotenv
from stock_indicators import indicators
from stock_indicators.indicators.common.quote import Quote
class Cctx_adapt:
    def __init__(self, connection,symbol,tf):
        self.connection =connection
        self.exchange 
        self.symbol 
        self.tf = tf
        self.unit = tf[1]
        self.df =[]
        self.df2 =[]
        self.market =[]
        self.tickers =[]
        self.order_list =[]
        self.orderFilled_list =[]
        self.position =0
        self.avgEntry =0
        # self.order_list.columns =["symbol","Type","Side","Amount","Price","Params"]
        self.mode ="live" #backtest,live
                # create bot crypto
                #     connect exchange
        #load_dotenv()
        #api_key = os.getenv("API_KEY")
        #secret_key = os.getenv("SECRET")

    def connection(self):  
        match self.connection["exchange"]:
            case "binance": self.exchange = ccxt.binance( )                     
        if self.connection["type"] == "demo":        
            self.adapter.set_sandbox_mode(True)
        self.exchange.apiKey =self.connection["api_key"]
        self.exchange.secret =self.connection["secret_key"]      
    
    def info(self):
        print ("CCTX ",self.exchange.name ,self.symbol ,self.tf)   
  
    def tf_div(self):
        delta =1000
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
    def format_data(self,data,):
        data.columns =["Datetime","Open","High","Low","Close","Volume"]
        data.Datetime = pd.to_datetime(data.Datetime,unit ="ms")  #locatime  
        return data        
    def get_OHLCV_from_date(self,date_from :datetime,buffer):
        date_from=int(date_from.timestamp())*1000
        return self.adapter.fetchOHLCV(symbol=self.symbol,timeframe=self.tf,since =date_from-buffer*self.tf_div(),limit =buffer)    
    def get_OHLCV_current(self,buffer):
        return self.adapter.fetchOHLCV(symbol=self.symbol,timeframe=self.tf,limit =buffer)     
    def simulate_market(self, data_market):
        #markets = self.exchange.load_markets()
        #tickers = self.exchange.fetch_tickers()
        ClosePrice = data_market["Close"]
        OpenPrice =  data_market["Open"]
        HighPrice =  data_market["High"]
        LowPrice =   data_market["Low"]
        Volume =     data_market["Volume"]
        print ("Update market", OpenPrice,HighPrice,LowPrice,ClosePrice,Volume)
        # fill order
        for index, i in self.order_list.iterrows():
        #i=0
        #while i < len(self.order_list):
            #print (self.order_list.iloc[i]) 
            #print (type(self.order_list))
            #print (self.order_list.tail(1))
            fill = False
            if i["Type"] == "market":
                fill = True
            if i["Type"] == "limit" and i["Side"] == "buy" and (LowPrice <=i["Price"] or ClosePrice <=i["Price"] ):    
                fill = True
            #add to filled list        
            if fill == True :
                #data_add =pd.Series(i)
                data_add =i
                #print ("data add")
                #print(data_add)
                #df_t=pd.DataFrame(data_add.to_frame())
                #print (df_t.tail(1))
                if len(self.orderFilled_list) ==0 :
                    #print("new df")
                    self.orderFilled_list =pd.DataFrame(i.to_dict(), index=[0])
                    #self.orderFilled_list =data_add.to_frame()
                else:     
                    #print("add to df")
                    self.orderFilled_list.loc[len(self.orderFilled_list)] =data_add
                #self.orderFilled_list[len(self.orderFilled_list)]["Status"] ="filled"   
                #print ("orderFilled_list",len(self.orderFilled_list))
                if i["Side"] =="buy":
                    self.position =self.position + i["Amount"]
                else:
                    self.position =self.position - i["Amount"]    
                #print (self.orderFilled_list.tail(1))    
            #remove from order list
                self.order_list = self.order_list.drop(index=index)      
            #i =i+1            
        #filled list
        for index,i in self.orderFilled_list.iterrows():
            #print("update profit")
            if i["Side"] =="buy":
                i["Profit"] = (ClosePrice - i["Price"] )* i["Amount"] 
            else :
                i["Profit"] = (i["Price"] -ClosePrice )* i["Amount"]   
            #print (i)    
        #maket order
        #limit order
        
        # postition , avg entry
            
        # balance update    
            


    def get_order(self):
        print (self.order_list)
    def get_filled_order(self):
        print (self.orderFilled_list)    
    def create_order(self,type,side,amount,price,params =None):
        # buy stop limit
         #const params = {
         #       'triggerPrice': 1700,
         #   }
         #    const order = await exchange.createOrder ('ETH/USDT', 'market', 'buy', 0.1, 1500, params)
        if self.mode == "backtest" :
            #add to order book
            order =  {"Symbol" :self.symbol, "Type":type,"Side": side,"Amount":amount,"Price":price,"Params":params}
            #print ("order list",len(self.order_list) )
            if len(self.order_list) ==0 :
                #self.order_list =pd.DataFrame([] )
                # self.order_list.append( order,ignore_index=True)
                #self.order_list =pd.DataFrame(order ) # error If using all scalar values, you must pass an index
                self.order_list =pd.DataFrame(order , index=[0])
                #self.order_list.loc[0] = order
                #print (self.order_list.dtypes)
                #self.order_list.columns =["symbol","Type","Side","Amount","Price","Params"]
            else:     
             
                #self.order_list.append(order,  ignore_index = True)
                self.order_list.loc[len(self.order_list)] = order
                #self.order_list.iloc[len(self.order_list),:] = pd.DataFrame(order , index=[len(self.order_list)])
            
        else :
            self.exchange.create_order(symbol =self.symbol,type= type,side =side,amount =amount,price = price,params =params )
    def get_balance(self):
        tickers = self.exchange.fetch_tickers()
        balance = self.exchange.fetch_balance()
        destination_code = 'USDT'
        total_destination_value = 0
        for code, amount in balance['total'].items():
            symbol = code + '/' + destination_code
            ticker = tickers.get(symbol, None)
            if ticker is not None:
                valuation = amount * ticker['last']
                total_destination_value += valuation
                print(amount, code, '=', valuation, destination_code)
                self.get_filled_order()
        #balanceasset
        # balance_list = self.exchange.fetch_balance()['info']['balances'] 
        # for i in balance_list:
        #     if i['asset'] == asset:
        #         print(asset,i['free'],i['locked'])
        # print(balance['info']['balances'])
    def event_on_calculate_bar(self):
        # print ("event on calcuate bar")
        # print ("update ", len(self.df))
        # print (self.df.head(1))
        print (self.df.tail(1))
    # def run_backtest(self,start,end,buffer):   
    #     data = self.exchange.fetchOHLCV(symbol=self.symbol,timeframe=self.tf,since =start-(buffer)*self.tf_div(),limit =buffer)
    #     self.df = pd.DataFrame(data)
    #     self.df.columns =["Timestamp","Open","High","Low","Close","Volume"]
    #     self.df.Timestamp=  pd.to_datetime(self.df.Timestamp,unit ="ms")    
    #     return  
    def run_simulate(self,start,end,buffer):
        self.mode ="backtest"
        #down buffer 
        #data1 = self.exchange.fetchOHLCV(symbol=self.symbol,timeframe=self.tf,since =start-(buffer)*self.tf_div())
        # data1 = self.exchange.fetchOHLCV(symbol=self.symbol,timeframe=self.tf,since =start,limit =10)
        data1 = self.exchange.fetchOHLCV(symbol=self.symbol,timeframe=self.tf,since =start-(buffer)*self.tf_div(),limit =buffer)
        #print ("back  ",buffer*self.tf_div(),unit ="ms")   )
        # print ("start - buffer ",pd.to_datetime(start-buffer*self.tf_div(),unit ="ms")   )
        # print (data1[0])
        # print ("start ",pd.to_datetime(start,unit ="ms")   )
        # print ("end ",pd.to_datetime(end,unit ="ms")   )
        self.df = pd.DataFrame(data1)
        self.df.columns =["Datetime","Open","High","Low","Close","Volume"]
        self.df.Datetime=  pd.to_datetime(self.df.Datetime,unit ="ms")  
        #down data range    
        limit = int( (end - start) / self.tf_div() ) +1
        # if limit == 0:
        #     limit =1
        #print ("range ",limit, "buffer ",buffer*self.tf_div() )
        data2 = self.exchange.fetchOHLCV(symbol=self.symbol,timeframe=self.tf,since =start,limit =limit)   
        df2 = pd.DataFrame(data2)
        #print (data2[0])
        df2.columns =["Datetime","Open","High","Low","Close","Volume"]
        df2.Datetime = pd.to_datetime(df2.Datetime,unit ="ms")  #locatime     
        # print ("data1")
        # print(self.df.head(1))  
        # print(self.df.tail(1))  
        # print ("data2")
        # print(df2.head(1))  
        # print(df2.tail(1))  
        i =0
        #loop   
        #while False:     
        while i < limit:        
            #slide each bar
            print ("step ",i+1," / ", limit)
            data_new = df2.iloc[i]
            i= i+1
            # print ("new data")                 
            self.df.loc[len(self.df),:] =data_new
            # self.df=self.df.shift(-1, axis=0) # shift 1 row
            # self.df=self.df.dropna()
            # calculate order
            self.event_on_calculate_bar()
            # calculate maket fill order
            print ("order ",len(self.order_list) )
            self.simulate_market(data_new )
            print ("order filled ",len(self.orderFilled_list) )
            print ("lol",self.position)
            #self.get_filled_order()
            # calculate balance
    def run_live(self,buffer):    
        self.mode ="live"
        #down buffer 
        data = self.exchange.fetchOHLCV(symbol=self.symbol,timeframe=self.tf,limit =buffer)
        self.df = pd.DataFrame(data)
        self.df.columns =["Datetime","Open","High","Low","Close","Volume"]
        self.df.Datetime=  pd.to_datetime(self.df.Datetime,unit ="ms")  
        #loop
        while True:
            #update lastest bar
            time.sleep(0.5)
            data_new = self.exchange.fetchOHLCV(symbol=self.symbol,timeframe=self.tf,limit =1)
            df2 = pd.DataFrame(data_new)
            df2.columns =["Datetime","Open","High","Low","Close","Volume"]
            df2.Datetime=  pd.to_datetime(df2.Datetime,unit ="ms")  
            last_bar_actual = self.df.iloc[-1][0] #last timestamp loaded bar
            last_bar_target = df2.iloc[-1][0]
   
            # print ( "last_bar_actual ", last_bar_actual )
            # print ("last_bar_target ",last_bar_target)
            delta_time = int(last_bar_target.timestamp()*1000 -last_bar_actual.timestamp()*1000 )
            # print("deta time ",delta_time/self.tf_div())
            if last_bar_actual == last_bar_target:
            
                #update daa
                # print ("update data")       
                self.df.iloc[-1,:] =df2.iloc[-1]
                # last_bar_actual = self.df.iloc[-1][0] #last timestamp loaded bar
                # last_bar_target = df2[-1][0]

            # #shift data
            else :   
                #print ("new data")                 
                self.df.loc[len(self.df),:] =df2.iloc[-1]
                self.df=self.df.shift(-1, axis=0) # shift 1 row
                self.df=self.df.dropna()
            # self.df2 =self.df.copy()    
 
            #finish data
            # calculate order   
            self.event_on_calculate_bar()
            #self.get_order()
            self.get_filled_order()
            # update balance  


    
          
#     def __init__(self, exchange_type,exchange,symbol,tf):   
#         strategy_bot.__init__(self, exchange_type,exchange,symbol,tf)

#     def back_test(self):
#         #ha
#         quotes = [
#         Quote(d,o,h,l,c,v) 
#         for d,o,h,l,c,v 
#         in zip(self.df['time'], self.df['open'], self.df['high'], self.df['low'], self.df['close'], self.df['volume'])
#         ]          
#         results = indicators.get_heikin_ashi(quotes)
#         self.df2= pd.DataFrame([r.date,r.open,r.close] for r in results)  
#         self.df2.columns =["date","hkOpen","hkClose"]                
# // path to the MetaTrader 5 terminal EXE file
#    path ="C:\Program Files\MetaTrader 5\",                    
