import os
from supabase import create_client, Client
from dotenv import load_dotenv
load_dotenv()
# Load environment variables from .env file
url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY")
supabase: Client = create_client(url, key)
# response = (
#     supabase.table("planets")
#     .insert({"id": 1, "name": "Pluto"})
#     .execute()
# )
# Kiểm tra kết nối bằng select thử
try:
    response = supabase.table("planets").select("*").execute()
    if response.data :
        print("✅ Kết nối Supabase thành công!")
        print("Sample data:", response.data)
    else:
        print("❌ Lỗi truy vấn Supabase!")
        print("Chi tiết:", response)
except Exception as e:
    print("❌ Exception khi kết nối Supabase:", str(e))