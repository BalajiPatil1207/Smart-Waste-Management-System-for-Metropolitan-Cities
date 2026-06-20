# Project Report: Smart Waste Management System for Metropolitan Cities

## 1. Project Abstract
Rapid urbanization in metropolitan cities has led to a significant increase in solid waste generation. Traditional waste collection systems are highly inefficient, resulting in overflowing bins, unhygienic environments, and wasted fuel for collection trucks. This project proposes a **Smart Waste Management System** leveraging the Internet of Things (IoT), IBM Cloud, and Node-RED. 

The system utilizes smart bins equipped with simulated sensors (ultrasonic for fill level, GPS for location, and temperature sensors for fire detection). The data is transmitted in real-time to the **IBM Watson IoT Platform** via a Python device simulator. **Node-RED** acts as the middleware, processing the incoming telemetry, visualizing it on an interactive dashboard (including live map tracking), and securely storing historical data in **IBM Cloudant DB**. When a bin reaches a critical threshold (>80% full), an automated SMS alert is triggered via the **Fast2SMS API** to notify municipal workers, ensuring optimized and timely waste collection.

## 2. Problem Statement
In metropolitan cities, municipal authorities follow a static routing system for waste collection. Trucks visit bins on a fixed schedule, regardless of whether the bin is empty or overflowing. This approach leads to:
* **Unhygienic Environments:** Overflowing bins cause health hazards and bad odors.
* **Resource Wastage:** Fuel and manpower are wasted visiting empty bins.
* **Lack of Analytics:** Authorities have no data to analyze waste generation patterns to optimize bin placement.

## 3. Objectives
* To design and simulate a Smart Waste Bin that monitors fill level, temperature, and GPS coordinates.
* To securely transmit telemetry data to the IBM Watson IoT Platform.
* To create a centralized Node-RED application for data processing and threshold management.
* To store real-time data in a NoSQL database (IBM Cloudant) for future analytics.
* To build an interactive UI Dashboard featuring gauges, charts, and a World Map for live bin tracking.
* To implement a real-time SMS notification system to alert authorities when bins are critical.

## 4. System Architecture
The system follows a classic 4-tier IoT Architecture:

1. **Device/Edge Layer:** A Python script utilizing the `wiotp-sdk` acts as the edge device, generating and publishing JSON payloads containing bin parameters.
2. **Connectivity/IoT Hub Layer:** IBM Watson IoT Platform authenticates the device and acts as the MQTT message broker to receive real-time events.
3. **Processing/Middleware Layer:** Node-RED subscribes to the IBM IoT Platform, parses the data, applies business logic (e.g., threshold checking), and routes data to multiple endpoints.
4. **Application/Storage Layer:**
    * **IBM Cloudant DB:** Stores JSON documents for every reading.
    * **Node-RED Dashboard:** Provides UI (Gauges, Charts).
    * **Node-RED Worldmap:** Plots bin locations dynamically.
    * **Fast2SMS API:** Sends HTTP POST requests to trigger mobile SMS alerts.

## 5. Workflow Diagram
```text
[ Python Simulator ]
      | (Generates JSON: Bin ID, Level, Temp, GPS)
      v
[ IBM Watson IoT Platform ] --> (MQTT Broker / Device Management)
      |
      v
[ Node-RED IBM IoT Input Node ]
      |
      +---> [ Function Node: Status Calc ] ---> [ Cloudant DB ] (Storage)
      |
      +---> [ UI Dashboard Nodes ] (Gauges, Text, Line Charts)
      |
      +---> [ Function Node: Map Format ] ---> [ World Map Node ] (Live Tracking)
      |
      +---> [ Function Node: Alert Logic ] ---> [ Fast2SMS HTTP Request ] --> (SMS to Mobile)
```

## 6. Modules Description
* **Device Module:** Python code simulating physical hardware. Generates random fluctuations in waste level and temperature.
* **IBM Watson IoT Module:** Handles device registry, security tokens, and MQTT message routing.
* **Data Processing Module:** Node-RED function nodes written in JavaScript. Calculates whether a bin is "Normal", "Moderate", or "Critical".
* **Storage Module:** IBM Cloudant DB. A fully managed NoSQL database configured to store time-series IoT data.
* **Dashboard Module:** Node-RED UI. Contains tabs for Dashboard (Gauges), Analytics (Charts), and Map (Live location markers with color-coding based on status).
* **Notification Module:** Integrates Fast2SMS API. Fires only when fill level > 80%.

## 7. Advantages
* **Optimized Routing:** Trucks only visit bins that require emptying, saving fuel and reducing carbon footprint.
* **Real-time Monitoring:** Authorities get a bird's-eye view of the city's cleanliness via the interactive map.
* **Fire Detection:** Temperature sensors can alert authorities to smoldering fires in bins before they escalate.
* **Data-Driven Decisions:** Historical data in Cloudant DB can be used to reallocate bins from low-usage areas to high-usage areas.

## 8. Future Scope
* **Machine Learning:** Integrating IBM Watson Studio to predict when a bin will become full based on historical trends.
* **Route Optimization Algorithm:** Dynamically generating Google Maps navigation links for the drivers showing the shortest path connecting only full bins.
* **Mobile App:** Creating a dedicated React Native app for drivers to mark bins as "Collected" directly from the field.

## 9. Conclusion
The Smart Waste Management System successfully demonstrates how cloud-based IoT architecture can solve real-world urban problems. By combining IBM Watson IoT, Node-RED, Cloudant DB, and SMS APIs, the system transforms a traditional, blind collection process into a data-driven, highly efficient, and automated workflow.
