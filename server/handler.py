from collections import deque

message_queue = deque(maxlen=20)

def handle_action(data: dict):
    message_queue.append(data)
    return {
        "channel": "xyz",
        "last_action": data.get("action"),
        "total_messages": len(message_queue)
    }

def get_messages():
    return list(message_queue)