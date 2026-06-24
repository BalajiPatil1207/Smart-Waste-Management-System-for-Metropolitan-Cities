import json
import os

filepaths = [
    r'd:\Desktop\MERN_FULL_STACK\Smart Waste Management System for Metropolitan Cities\node_red\flow.json',
    r'C:\Users\Balaji\.node-red\flows.json'
]

new_func = """let bins = [
    {id: "BIN001", lat: 28.6139, lon: 77.2090},
    {id: "BIN002", lat: 28.6230, lon: 77.2150},
    {id: "BIN003", lat: 28.6050, lon: 77.1950},
    {id: "BIN004", lat: 28.6180, lon: 77.2010},
    {id: "BIN005", lat: 28.6090, lon: 77.2180},
    {id: "BIN006", lat: 28.6280, lon: 77.1980}
];

let fleet = global.get('fleetData') || {};

let results = bins.map(b => {
    let prev = fleet[b.id] || {};
    
    let currentFill = prev.Fill_Level !== undefined ? prev.Fill_Level : 0;
    
    // If it reached 100, reset it to 0 (Simulate Collection)
    if (currentFill >= 100) {
        currentFill = 0;
    } else {
        // Increment fill level by random 5 to 15%
        currentFill += Math.floor(Math.random() * 11) + 5; 
        if (currentFill > 100) currentFill = 100;
    }
    
    let gas = Math.floor(Math.random() * 300) + 50;
    
    // Battery drops slowly
    let bat = prev.Battery_Level !== undefined ? prev.Battery_Level : 100;
    if (Math.random() > 0.5) bat -= 1;
    if (bat < 5) bat = 100; 
    
    let status = "Normal";
    if(currentFill >= 95) status = "Critical Full";
    else if(gas > 350) status = "Toxic Odor";
    else if(bat < 20) status = "Low Battery";
    else if(currentFill > 50) status = "Moderate";
    else status = "Empty";

    let newData = {
        Bin_ID: b.id,
        Latitude: b.lat,
        Longitude: b.lon,
        Fill_Level: currentFill,
        Temperature: Math.floor(Math.random() * 15) + 30,
        Battery_Level: bat,
        Methane_PPM: gas,
        Humidity: prev.Humidity !== undefined ? prev.Humidity : 55,
        Lid_Status: prev.Lid_Status !== undefined ? prev.Lid_Status : "CLOSED",
        Solar_Charge: prev.Solar_Charge !== undefined ? prev.Solar_Charge : 0,
        Timestamp: new Date().toISOString(),
        Status: status
    };
    
    fleet[b.id] = newData;
    return newData;
});

global.set('fleetData', fleet);

return [[ {payload: results[0]}, {payload: results[1]}, {payload: results[2]}, {payload: results[3]}, {payload: results[4]}, {payload: results[5]} ]];"""

for filepath in filepaths:
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)
        for node in data:
            if node.get('id') == 'sensor_gen' and node.get('type') == 'function':
                node['func'] = new_func
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=4)
        print(f'Updated logic in {filepath}')
    except Exception as e:
        print(f'Error updating {filepath}: {e}')
