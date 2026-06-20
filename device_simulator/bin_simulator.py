import wiotp.sdk.device
import time
import random
import json
from datetime import datetime

# ==============================================================================
# IBM Watson IoT Platform Device Configuration
# ==============================================================================
# REPLACE these values with your actual device credentials from IBM Cloud
# You will get these details after creating a device in IBM Watson IoT Platform
myConfig = { 
    "identity": {
        "orgId": "YOUR_ORG_ID",          # e.g., "1a2b3c"
        "typeId": "NodeMCU",             # Device Type name
        "deviceId": "BIN001"             # Device ID
    },
    "auth": {
        "token": "YOUR_DEVICE_TOKEN"     # Authentication Token generated
    }
}

def generate_random_data():
    """
    Generates random telemetry data to simulate a smart waste bin.
    Includes GPS coordinates, fill level, temperature, and timestamp.
    """
    # Simulating coordinates for a metropolitan city center (e.g., Delhi coordinates)
    base_lat = 28.6139
    base_lon = 77.2090
    
    # Generate random values for simulation
    data = {
        "Bin_ID": myConfig["identity"]["deviceId"],
        "Latitude": round(base_lat + random.uniform(-0.05, 0.05), 6),
        "Longitude": round(base_lon + random.uniform(-0.05, 0.05), 6),
        "Fill_Level": random.randint(0, 100),                # Percentage: 0 to 100%
        "Temperature": round(random.uniform(25.0, 45.0), 1), # Temperature in Celsius
        "Timestamp": datetime.now().isoformat()              # Current date and time in ISO format
    }
    return data

def main():
    print("======================================================")
    print(" Starting Smart Waste Management System Simulator...")
    print("======================================================")
    
    try:
        # Initialize the IBM Watson IoT Device Client
        # logHandlers=None prevents overly verbose logging in console
        client = wiotp.sdk.device.DeviceClient(config=myConfig, logHandlers=None)
        
        # Connect to the IBM Watson IoT Platform
        client.connect()
        print("[SUCCESS] Connected to IBM Watson IoT Platform!")
        print("Publishing data every 2 seconds. Press Ctrl+C to stop.\n")
        
        # Infinite loop to continuously publish data
        while True:
            # 1. Generate the random telemetry data
            telemetry_data = generate_random_data()
            
            # 2. Print the generated data to the console for verification
            print(f"Publishing data: {json.dumps(telemetry_data)}")
            
            # 3. Publish data to Watson IoT Platform
            # Parameters: eventId, msgFormat, data, qos (Quality of Service)
            client.publishEvent(eventId="status", msgFormat="json", data=telemetry_data, qos=0)
            
            # 4. Wait for 2 seconds before generating and sending the next reading
            time.sleep(2)
            
    except KeyboardInterrupt:
        # Graceful exit when user presses Ctrl+C
        print("\n[INFO] Simulation stopped by user.")
    except Exception as e:
        # Handle connection or publishing errors
        print(f"\n[ERROR] Failed connecting or publishing to Watson IoT Platform:\n{str(e)}")
        print("\nPlease check your credentials (orgId, typeId, deviceId, token) and internet connection.")
    finally:
        # Ensure the client disconnects gracefully
        if 'client' in locals():
            client.disconnect()
            print("[INFO] Disconnected from IBM Watson IoT Platform.")

if __name__ == "__main__":
    main()
