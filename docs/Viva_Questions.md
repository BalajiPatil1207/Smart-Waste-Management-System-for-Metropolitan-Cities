# Viva Questions & Answers

1. **What is the primary objective of this project?**
   *Answer:* To optimize waste collection in metropolitan cities by using IoT to monitor bin fill levels, locations, and temperatures in real-time, thereby reducing fuel consumption and maintaining hygiene.

2. **What is the IBM Watson IoT Platform?**
   *Answer:* It is a fully managed, cloud-hosted service that makes it simple to derive value from IoT devices. It acts as an MQTT broker handling device registration, connectivity, and message routing.

3. **Which protocol does Watson IoT Platform use for communication?**
   *Answer:* It uses MQTT (Message Queuing Telemetry Transport), which is a lightweight, publish-subscribe network protocol designed for devices with limited bandwidth.

4. **What is Node-RED?**
   *Answer:* Node-RED is a flow-based programming tool built on Node.js. It provides a browser-based editor that makes it easy to wire together hardware devices, APIs, and online services.

5. **Why did you use IBM Cloudant DB instead of a SQL database like MySQL?**
   *Answer:* Cloudant is a NoSQL JSON document store. Since IoT devices typically send data in JSON format, storing it directly in a NoSQL database is faster, more flexible (no rigid schema), and highly scalable for massive amounts of time-series data.

6. **What does the Python simulator script do?**
   *Answer:* Since we don't have physical ultrasonic and GPS hardware, the Python script acts as an edge device. It uses the `wiotp-sdk` to generate random telemetry data (fill level, temp, lat, lon) and publishes it to the cloud.

7. **How does the system know when a bin is full?**
   *Answer:* We configured a Node-RED function node to check the incoming JSON payload. If `Fill_Level > 80`, the status is set to 'Critical'.

8. **How is the SMS notification sent?**
   *Answer:* When the fill level exceeds 80%, a Node-RED HTTP Request node sends a POST request to the Fast2SMS API with the appropriate headers (API Key) and payload (mobile number, message).

9. **What is the role of the 'World Map' node in Node-RED?**
   *Answer:* It provides a dynamic web page that plots markers based on latitude and longitude coordinates received in the payload, allowing real-time tracking of the bins.

10. **Explain the four layers of IoT architecture used in your project.**
    *Answer:* 1. Edge Layer (Python script/sensors). 2. Connectivity Layer (IBM Watson IoT MQTT). 3. Middleware/Processing Layer (Node-RED). 4. Application/Storage Layer (Cloudant, Dashboard, Fast2SMS).

11. **What is Quality of Service (QoS) in MQTT? What did you use?**
    *Answer:* QoS determines the guarantee of message delivery. We used QoS 0 (At most once), which means the message is delivered according to the best efforts of the operating environment (fire and forget).

12. **Why monitor temperature in a waste bin?**
    *Answer:* To detect fires or chemical reactions. If a lit cigarette is thrown into the bin, the temperature spike will act as a fire alarm.

13. **How do you ensure the security of the data being transmitted?**
    *Answer:* Communication between the Python device and IBM Watson IoT is secured via TLS/SSL encryption, and the device authenticates using a unique token generated during device registration.

14. **What are the key components of the payload sent by the device?**
    *Answer:* Bin_ID, Latitude, Longitude, Fill_Level, Temperature, and Timestamp.

15. **If the internet goes down at the bin location, what happens?**
    *Answer:* In a real-world scenario, the physical device (like an ESP32 or Raspberry Pi) would fail to publish MQTT messages. Node-RED wouldn't receive updates, and the dashboard would show the last known state. Edge caching could be implemented in future scope.

16. **How does the Node-RED Dashboard gauge know which value to display?**
    *Answer:* The gauge node is configured to extract the value from `msg.payload.Fill_Level` or `msg.payload.Temperature`.

17. **What is the function of the JSON node in Node-RED?**
    *Answer:* Sometimes MQTT data arrives as a string. The JSON node parses the string into a workable JavaScript Object so function nodes can read properties like `msg.payload.Fill_Level`.

18. **Can this system be scaled to handle 10,000 bins?**
    *Answer:* Yes. IBM Watson IoT and Cloudant are highly scalable cloud services. We would only need to register the new devices and the architecture would handle the load.

19. **What are the environmental benefits of your project?**
    *Answer:* It prevents the overflowing of waste (reducing pollution/disease) and optimizes garbage truck routes, thereby reducing fuel consumption and greenhouse gas emissions.

20. **How did you integrate the Fast2SMS API?**
    *Answer:* Using the `http request` node in Node-RED configured for a POST method. We passed the authorization key in `msg.headers` and the form-urlencoded data (route, message, numbers) in `msg.payload`.
