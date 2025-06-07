import MetaTrader5 as mt5
import logging
import time
connection = {
    "server": "Exness-MT5Trial6",
    "login": 273099115,
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
# mt5.initialize()
# time.sleep(0.5)
# init = mt5.login(
#         login =connection["login"],             #Aount number
#         password =connection["password"],     # password
#         server = connection["server"],          # server name as it is specified in the terminal
#         timeout= 60,         # timeout 60s
#         )
print(mt5.account_info())

if init :
    logging.info(f"connect mt5 succesful {symbol} {tf}")   
else:
    logging.info(f"connect mt5 error {mt5.last_error()}")    