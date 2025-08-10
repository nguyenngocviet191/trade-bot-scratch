import MetaTrader5 as mt5
import logging
import time
import json
from datetime import datetime
import pandas as pd
import numpy as np
import os

print("test report mt5")
current_dir = os.path.dirname(__file__)
# Đi tới thư mục gốc (root/)
root_dir = os.path.abspath(os.path.join(current_dir, ".."))
# Ghép đường dẫn tới file accounts.json
file_path = os.path.join(root_dir, "accounts.json")

connections = None
with open(file_path, "r", encoding="utf-8") as f:
    connections = json.load(f)
    # Load connection details from a JSON file
connection = connections["fx_bot2"]
# DEAL data
# position_id
# entry : open(0), close (1)
# type : buy (0) ,sell (1)
# ORDER data
# get tiket_id = order_id
# volume,tp,sl
# type : buy (0) ,sell (1)
symbol = "BTCUSDm"
tf = "H1"
init = mt5.initialize(
    login=connection["login"],  # Aount number
    password=connection["password"],  # password
    # server name as it is specified in the terminal
    server=connection["server"],
    timeout=60,  # timeout 60s
)


if init:
    print(f"connect mt5 succesful {symbol} {tf}")
    logging.info(f"connect mt5 succesful {symbol} {tf}")
else:
    print(f"connect mt5 error {mt5.last_error()}")
    logging.info(f"connect mt5 error {mt5.last_error()}")
# Thiết lập khoảng thời gian muốn lấy
from_date = datetime(2025, 1, 1)
to_date = datetime(2025, 7, 13)
history = mt5.history_deals_get(from_date, to_date)
# Lấy lịch sử giao dịch
deals_df = pd.DataFrame(list(history), columns=history[0]._asdict().keys())
deals_df["time"] = pd.to_datetime(deals_df["time"], unit="s")

# Lọc giao dịch khớp lệnh (buy/sell)
orders = deals_df[deals_df["type"].isin([0, 1])]  # 0: Buy, 1: Sell

print(orders[["time", "symbol", "type", "volume", "price", "profit"]])
orders.to_csv("report_mt5.csv", index=False)

# Tổng lợi nhuận
total_profit = orders["profit"].sum()

# Lợi nhuận trung bình/giao dịch
avg_profit = orders["profit"].mean()

# Số lệnh thắng/thua
win_count = len(orders[orders["profit"] > 0])
lose_count = len(orders[orders["profit"] < 0])

# Tỷ lệ win
win_rate = win_count / len(orders) * 100

# print(f"Lợi nhuận tổng: {total_profit}")
# print(f"Lợi nhuận trung bình: {avg_profit}")
# print(f"Win: {win_count}, Lose: {lose_count}, Win rate: {win_rate:.2f}%")

# Tạo cột vốn lũy kế (equity curve)
orders = orders.sort_values(by="time")
orders["cumulative_profit"] = orders["profit"].cumsum()

# Tính max drawdown
cumulative = orders["cumulative_profit"]
peak = cumulative.cummax()
drawdown = cumulative - peak
max_drawdown = drawdown.min()

# print(f"🔻 Max Drawdown: {max_drawdown:.2f}")
wins = orders[orders["profit"] > 0]
losses = orders[orders["profit"] < 0]

win_rate = len(wins) / len(orders)
loss_rate = 1 - win_rate

avg_win = wins["profit"].mean() if not wins.empty else 0
avg_loss = abs(losses["profit"].mean()) if not losses.empty else 0

expectancy = (win_rate * avg_win) - (loss_rate * avg_loss)

# print(f"📈 Expectancy: {expectancy:.2f} (Lợi nhuận kỳ vọng mỗi lệnh)")
risk_reward_ratio = avg_win / avg_loss if avg_loss != 0 else np.nan

# print(f"⚖️ Risk-Reward Ratio: {risk_reward_ratio:.2f}")

report = {
    "Total Trades": len(orders),
    "Total Profit": orders["profit"].sum(),
    "Win Rate (%)": win_rate * 100,
    "Average Win": avg_win,
    "Average Loss": avg_loss,
    "Expectancy": expectancy,
    "Max Drawdown": max_drawdown,
    "Risk-Reward Ratio": risk_reward_ratio,
}

report_df = pd.DataFrame(report.items(), columns=["Metric", "Value"])
report_df.to_csv("summary_report.csv", index=False)
print(report_df)
