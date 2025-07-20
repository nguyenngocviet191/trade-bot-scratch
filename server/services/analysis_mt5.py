import MetaTrader5 as mt5
import json
import pandas as pd
import numpy as np
from datetime import datetime


def analyze_mt5(account_key: str, from_date: datetime, to_date: datetime):
    file_path = "accounts.json"
    with open(file_path, "r", encoding="utf-8") as f:
        connections = json.load(f)
    connection = connections[account_key]

    init = mt5.initialize(
        login=connection["login"],
        password=connection["password"],
        server=connection["server"],
        timeout=60,
    )

    if not init:
        return {"error": f"connect mt5 error: {mt5.last_error()}"}

    # Lấy dữ liệu deal từ 01/01/2025 đến 08/06/2025
    from_date = from_date
    to_date = to_date
    # to_date = datetime.today()
    # from_date = datetime(2025, 1, 1)
    # from_date = datetime(2025, 1, 1)
    history = mt5.history_deals_get(from_date, to_date)
    if history is None or len(history) == 0:
        return {"error": "No trade history found"}

    deals_df = pd.DataFrame(list(history), columns=history[0]._asdict().keys())
    deals_df['time'] = pd.to_datetime(deals_df['time'], unit='s')
    orders = deals_df[deals_df['type'].isin([0, 1])]

    orders = orders.sort_values(by='time')
    orders['cumulative_profit'] = orders['profit'].cumsum()
    cumulative = orders['cumulative_profit']
    peak = cumulative.cummax()
    drawdown = cumulative - peak
    max_drawdown = drawdown.min()

    wins = orders[orders['profit'] > 0]
    losses = orders[orders['profit'] < 0]

    win_rate = len(wins) / len(orders) if len(orders) > 0 else 0
    loss_rate = 1 - win_rate
    avg_win = wins['profit'].mean() if not wins.empty else 0
    avg_loss = abs(losses['profit'].mean()) if not losses.empty else 0
    expectancy = (win_rate * avg_win) - (loss_rate * avg_loss)
    risk_reward_ratio = avg_win / avg_loss if avg_loss != 0 else 0

    report = {
        "total_trades": len(orders),
        "total_profit": orders['profit'].sum(),
        "win_rate_percent": round(win_rate * 100, 2),
        "average_win": round(avg_win, 2),
        "average_loss": round(avg_loss, 2),
        "expectancy": round(expectancy, 2),
        "max_drawdown": round(max_drawdown, 2),
        "risk_reward_ratio": round(risk_reward_ratio, 2),
    }

    return report
