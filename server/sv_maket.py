from fastapi import FastAPI, WebSocket
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from .services.coinmaketcap_service import fetch_market_data
import json

app = FastAPI()
# Cho phép gọi từ frontend local
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173","http://localhost:8000"],  # hoặc ["http://localhost:5173"]
    # allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
@app.get("/api/market")
async def get_market():
    data = await fetch_market_data()
    # print(data)
    # return json.loads(data)
    # data =JSON.parse(data)
    data = json.loads(data)
    return data

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    while True:
        try:
            message = await websocket.receive_text()
            if message == "get_data":
                data = await fetch_market_data()
                # await websocket.send_text(data)
                await websocket.send_json(data)
        except Exception as e:
            await websocket.close()
            break