# Smart Waste Management System for Metropolitan Cities

Welcome to the **Smart Waste Management System** final-year engineering project! 

This repository contains all the necessary code, flows, and documentation to build a complete end-to-end IoT system using IBM Cloud services, Node-RED, and Python.

## Directory Structure

* **`/device_simulator`**: Contains the Python code `bin_simulator.py` that generates simulated GPS, temperature, and fill-level data and publishes it to IBM Watson IoT Platform.
* **`/node_red`**: Contains the `flow.json` file which you can import directly into Node-RED to instantly build the backend, dashboard, map, and SMS integration. Reference JavaScript code for the function nodes is also provided.
* **`/docs`**: Comprehensive documentation required for your college submission and SmartInternz evaluation.
  * `Project_Report.md`: Full thesis abstract, architecture, advantages, and conclusion.
  * `Implementation_Steps.md`: Step-by-step guide on how to deploy this project.
  * `Cloudant_DB_Design.md`: JSON schema for the NoSQL database.
  * `Viva_Questions.md`: 20 common interview/viva questions and answers.
  * `SmartInternz_Checklist.md`: List of all screenshots required for final submission.

## Quick Start

1. Follow the instructions in `docs/Implementation_Steps.md` to set up your IBM Cloud account.
2. Register a device in Watson IoT Platform.
3. Add your credentials to `device_simulator/bin_simulator.py` and run it.
4. Import `node_red/flow.json` into Node-RED.
5. Add your Fast2SMS and Cloudant credentials into the respective nodes in Node-RED.
6. Click Deploy in Node-RED and open the Dashboard (`http://localhost:1880/ui`) to see your project in action!

## Tech Stack
- **Edge Device**: Python Simulator (`wiotp-sdk`)
- **IoT Hub**: IBM Watson IoT Platform (MQTT Broker)
- **Middleware & UI**: Node-RED, Node-RED Dashboard, Node-RED Worldmap
- **Database**: IBM Cloudant (NoSQL)
- **Alerts**: Fast2SMS API
