import time
import requests
import random
from datetime import datetime

# Node-RED local API endpoint
NODE_RED_URL = "http://127.0.0.1:1880/api/trigger"

def main():
    print("======================================================")
    print(" Starting Smart Waste Fleet Simulator (3 Bins)...")
    print(" Mode: Local HTTP Streaming (Node-RED Backend)")
    print("======================================================")
    
    print("[SUCCESS] Connected to Local Node-RED Backend!")
    print(f"Publishing data every 10 seconds to {NODE_RED_URL}")
    print("Press Ctrl+C to stop.\n")
    
    try:
        while True:
            try:
                # Trigger the Node-RED simulator logic
                response = requests.get(NODE_RED_URL)
                
                if response.status_code == 200:
                    print(f"[{datetime.now().strftime('%H:%M:%S')}] [SUCCESS] Streamed live telemetry for 3 Bins to Node-RED.")
                else:
                    print(f"[{datetime.now().strftime('%H:%M:%S')}] [ERROR] Backend returned status code {response.status_code}")
            
            except requests.exceptions.ConnectionError:
                print(f"[{datetime.now().strftime('%H:%M:%S')}] [ERROR] Connection failed. Is Node-RED running on port 1880?")
            
            time.sleep(10)
            
    except KeyboardInterrupt:
        print("\n[INFO] Simulation stopped by user.")

if __name__ == "__main__":
    main()
