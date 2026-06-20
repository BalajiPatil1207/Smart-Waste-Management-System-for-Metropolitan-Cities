/**
 * Node-RED Function Nodes Reference Code
 * 
 * This file contains the JavaScript code used within the Node-RED Function nodes
 * to process the telemetry data coming from the IBM Watson IoT Platform.
 */

// ==============================================================================
// Function 1: Parse and Calculate Bin Status
// Goal: Determine bin status based on fill level and prepare payload.
// ==============================================================================
let data = msg.payload;

let status = "Empty";
// Threshold logic for waste level
if(data.Fill_Level > 80) {
    status = "Critical"; // Needs immediate collection
} else if(data.Fill_Level > 50) {
    status = "Moderate"; // Getting full
} else {
    status = "Normal";   // Empty or mostly empty
}

// Append status to payload
data.Status = status;
msg.payload = data;
return msg;


// ==============================================================================
// Function 2: Cloudant DB Formatting
// Goal: Format the object exactly as it needs to be stored in the NoSQL database.
// ==============================================================================
msg.payload = {
    Bin_ID: msg.payload.Bin_ID,
    Latitude: msg.payload.Latitude,
    Longitude: msg.payload.Longitude,
    Fill_Level: msg.payload.Fill_Level,
    Temperature: msg.payload.Temperature,
    Timestamp: msg.payload.Timestamp,
    Status: msg.payload.Status
};
return msg;


// ==============================================================================
// Function 3: Prepare Map Marker Data (World Map Node)
// Goal: Format the payload for the `node-red-contrib-web-worldmap` node.
// ==============================================================================
msg.payload = {
    name: msg.payload.Bin_ID, // Name of the marker
    lat: msg.payload.Latitude,
    lon: msg.payload.Longitude,
    // Icon changes color based on fill level
    icon: "trash",
    iconColor: msg.payload.Fill_Level > 80 ? "red" : (msg.payload.Fill_Level > 50 ? "orange" : "green"),
    // HTML tooltip that shows up when clicking the marker
    extrainfo: `<b>Bin ID:</b> ${msg.payload.Bin_ID} <br/> 
                <b>Fill Level:</b> ${msg.payload.Fill_Level}% <br/> 
                <b>Temp:</b> ${msg.payload.Temperature}°C <br/>
                <b>Status:</b> ${msg.payload.Status}`
};
return msg;


// ==============================================================================
// Function 4: SMS Alert Trigger (Fast2SMS API)
// Goal: Check if fill level exceeds 80% and trigger an HTTP request to Fast2SMS.
// ==============================================================================
// Only trigger alert if Fill Level is critical
if(msg.payload.Fill_Level > 80) {
    
    // Create alert message
    let alertMsg = `ALERT: Waste Bin ${msg.payload.Bin_ID} is at ${msg.payload.Fill_Level}% capacity. Immediate collection required.`;
    
    // Fast2SMS API headers
    msg.headers = {
        "authorization": "YOUR_FAST2SMS_API_KEY", // Replace with your Fast2SMS API Key
        "Content-Type": "application/x-www-form-urlencoded"
    };
    
    // URL-encoded payload required by Fast2SMS
    msg.payload = {
        "route": "v3",
        "sender_id": "FTWSMS",
        "message": alertMsg,
        "language": "english",
        "flash": 0,
        "numbers": "YOUR_MOBILE_NUMBER" // Replace with recipient's 10-digit mobile number
    };
    
    return msg; // Proceeds to the HTTP Request node
}

// Return null stops the flow here if the bin is NOT > 80% full
return null;
