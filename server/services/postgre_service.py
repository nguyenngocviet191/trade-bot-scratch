import pandas as pd
from sqlalchemy import create_engine,text
from dotenv import load_dotenv
import os
load_dotenv()
# Thông tin kết nối PostgreSQL
DB_USER = os.getenv( "POSTGRES_USER")
DB_PASSWORD = os.getenv("POSTGRES_PASSWORD")
DB_HOST = os.getenv("POSTGRES_HOST", "localhost")
DB_PORT = os.getenv("POSTGRES_PORT", "5432")  
DB_NAME = os.getenv("POSTGRES_DB")

engine = create_engine(f"postgresql+psycopg2://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}")

def save_ohlcv(df):
    table_name ="ohlcv_data"
    #check if dataframe has required columns
    required_columns = ["symbol", "tf", "timestamp", "open", "high", "low", "close", "volume","ema10","sma20","sma50","sma200","adx","di+","di-"]
    if not isinstance(df, pd.DataFrame) or df.empty:
        raise ValueError("Error dataframe")
    for col in required_columns:
        if col not in df.columns:
            raise ValueError(f"Insert DataFrame is missing required column: {col}")
    df.to_sql(table_name, engine, if_exists="append", index=False) # |replace|append
    print(f"✅ Đã lưu DataFrame vào bảng '{table_name}' by {len(df)} rows")
    print(df.tail(5))
def delete_ohlcv():
    table_name ="ohlcv_data"
    
    with engine.connect() as conn:
        conn.execute(text(f"DROP TABLE IF EXISTS {table_name}")) 
def read_ohlcv(tf,symbol=None):
    """
    Chi lay 1 symbol hoac toan bo
    """
    table_name ="ohlcv_data"
    if symbol:
        df = pd.read_sql(f"SELECT * FROM {table_name} WHERE tf ='{tf}' AND symbol = '{symbol}'", engine)
    else:
        df = pd.read_sql(f"SELECT * FROM {table_name} WHERE tf ='{tf}'", engine)
    print(f"✅ Dữ liệu đọc lại từ '{table_name}'  by {len(df)} rows")  
    print(df.tail(5))
    return df