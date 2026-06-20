# SmartInternz Submission Checklist

Use this checklist to ensure you have captured all required screenshots and evidence for your final project submission on the SmartInternz portal.

## 1. IBM Cloud Account Creation
- [ ] Screenshot of your IBM Cloud Dashboard showing your logged-in profile.
- [ ] Screenshot of your Resource List showing active Watson IoT and Cloudant services.

## 2. IBM Watson IoT Platform Configuration
- [ ] Screenshot of the **Device Type** creation screen (showing `WasteBinDevice`).
- [ ] Screenshot of the **Device Registration** screen (showing `Bin_001`).
- [ ] Screenshot of the **Security / Authentication** screen showing the generated token.
- [ ] Screenshot of the **Recent Data** or **State** tab showing incoming JSON payloads.

## 3. Python Device Simulator
- [ ] Screenshot of the VS Code (or IDE) window showing the Python code (`bin_simulator.py`).
- [ ] Screenshot of the terminal/command prompt showing the output (`Publishing data: {"Bin_ID": ...}`).

## 4. Node-RED Configuration
- [ ] Screenshot of the complete Node-RED flow editor showing all connected nodes (IoT In, Functions, DB, Dashboard, SMS).
- [ ] Screenshot of the IBM IoT In node configuration panel (showing API key setup).
- [ ] Screenshot of the Function Node code (showing the Javascript logic).

## 5. IBM Cloudant DB
- [ ] Screenshot of the Cloudant Dashboard showing the `waste_management` database.
- [ ] Screenshot of a specific JSON document opened in Cloudant, showing the fields (Latitude, Longitude, Fill_Level, etc.).

## 6. Dashboard & Visualization
- [ ] Screenshot of the **Dashboard Tab** UI showing the Waste Level and Temperature gauges.
- [ ] Screenshot of the **Analytics Tab** UI showing the Line Chart plotting historical levels.
- [ ] Screenshot of the **World Map** UI showing the location marker of the bin.

## 7. SMS Notification
- [ ] Screenshot of the Fast2SMS dashboard showing the API key or delivery report.
- [ ] **Photo/Screenshot from your Mobile Phone** showing the received text message (e.g., "ALERT: Waste Bin Bin_001 is at 85% capacity...").

## Final Report Compilation
- Compile all the above screenshots sequentially into a single PDF or Word Document.
- Add brief captions under each screenshot explaining what it represents.
- Attach the `Project_Report.md` content as your main project thesis/report.
