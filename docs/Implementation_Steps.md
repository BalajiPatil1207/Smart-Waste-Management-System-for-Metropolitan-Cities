# Implementation Steps

Follow these step-by-step instructions to implement the Smart Waste Management System from scratch.

## Step 1: IBM Cloud Account & Services
1. **Create an IBM Cloud Account:** Go to [cloud.ibm.com](https://cloud.ibm.com/) and register.
2. **Create IoT Platform Service:**
   - Search for **Internet of Things Platform** in the IBM Cloud Catalog.
   - Select the Lite (Free) plan and click **Create**.
   - Click **Launch** to open the Watson IoT Platform dashboard.
3. **Create Cloudant DB Service:**
   - Search for **Cloudant** in the catalog.
   - Select IAM authentication and the Lite plan.
   - Click **Create**.
   - Launch the Cloudant dashboard and create a new database named `waste_management`.

## Step 2: Register Device in Watson IoT
1. In the Watson IoT Platform dashboard, go to **Devices** -> **Device Types**.
2. Click **Add Device Type**, name it `WasteBinDevice`, and save.
3. Go to the **Devices** tab and click **Add Device**.
4. Select `WasteBinDevice` as the type, and enter `Bin_001` as the Device ID.
5. Proceed to the authentication step and auto-generate an authentication token.
6. **IMPORTANT:** Copy the `Organization ID`, `Device Type`, `Device ID`, and `Authentication Token`. You will need these for the Python code.

## Step 3: Run the Python Simulator
1. Install Python (3.x) on your local machine.
2. Navigate to the `device_simulator` folder in this project.
3. Install the required libraries:
   ```bash
   pip install -r requirements.txt
   ```
4. Open `bin_simulator.py` and replace `YOUR_ORG_ID` and `YOUR_DEVICE_TOKEN` with the credentials from Step 2.
5. Run the simulator:
   ```bash
   python bin_simulator.py
   ```
6. Verify in the Watson IoT Platform dashboard (Recent Data tab) that events are being received.

## Step 4: Setup Node-RED
1. **Install Node-RED Locally:** (Ensure Node.js is installed)
   ```bash
   npm install -g --unsafe-perm node-red
   node-red
   ```
   Open `http://localhost:1880`.
2. **Install Required Palettes:**
   Go to the menu (top right) -> Manage Palette -> Install. Search and install:
   - `node-red-contrib-scx-ibmiotapp` (IBM IoT)
   - `node-red-node-ui` (Dashboard)
   - `node-red-contrib-web-worldmap` (World Map)
   - `node-red-node-cf-cloudant` (Cloudant)

## Step 5: Import and Configure Flow
1. Go to the menu -> **Import**.
2. Select the `node_red/flow.json` file provided in this project and click Import.
3. **Configure IBM IoT In Node:**
   - Double click the `Receive Bin Data` node.
   - Add new `ibmiot` credentials by clicking the pencil icon. Provide your API Key and API Token (generate this in Watson IoT Platform -> Apps -> Generate API Key).
4. **Configure Cloudant Node:**
   - Double click the `Cloudant DB` node.
   - Add new Cloudant credentials (copy URL and API Key from your IBM Cloudant service credentials page).
5. **Configure Fast2SMS API:**
   - Create an account on [Fast2SMS.com](https://www.fast2sms.com/).
   - Get your API Key from the Dev API section.
   - Open the `SMS Alert Trigger` function node and replace `YOUR_FAST2SMS_API_KEY` and `YOUR_MOBILE_NUMBER`.

## Step 6: Deploy and Test
1. Click the red **Deploy** button in Node-RED.
2. Ensure the Python simulator is running.
3. Open the Dashboard: `http://localhost:1880/ui`
   - You should see the Gauges and Charts updating every 2 seconds.
4. Open the World Map: `http://localhost:1880/worldmap`
   - You should see the bin marker jumping slightly (simulated) and changing color based on the status.
5. Open Cloudant Dashboard. Verify that JSON documents are being inserted.
6. When the Python simulator generates a Fill Level > 80, check your mobile phone for the SMS alert.
