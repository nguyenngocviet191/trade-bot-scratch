import asyncio
import websockets

# mac dinh socket goi tin ~ 1mb -> can mo rong
async def listen():
    uri = "ws://localhost:8000/ws"  # Thay bằng địa chỉ server thật
    async with websockets.connect(uri) as websocket:
        print("✅ Đã kết nối tới WebSocket server")

        # Gửi yêu cầu tới server nếu cần
        await websocket.send("get_listing")

        while True:
            try:
                message = await websocket.recv()
                print("📩 Nhận được:", message)
            except websockets.exceptions.ConnectionClosed:
                print("❌ Kết nối bị đóng")
                break

# Chạy
asyncio.run(listen())