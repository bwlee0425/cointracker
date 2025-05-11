import websocket
import json

def on_message(ws, message):
    data = json.loads(message)
    print(json.dumps(data, indent=2))

def on_open(ws):
    print("✅ Connected to BTCUSDT ticker stream")

ws = websocket.WebSocketApp(
    "wss://fstream.binance.com/ws/btcusdt@ticker",
    on_open=on_open,
    on_message=on_message
)

ws.run_forever()
