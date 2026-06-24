import json

path = r"C:\Users\Balaji\.node-red\flows.json"
with open(path, 'r', encoding='utf-8') as f:
    data = json.load(f)

new_func = """let fleet = global.get('fleetData') || {};

let bins = [
    {id: "BIN001", lat: 28.6139, lon: 77.2090},
    {id: "BIN002", lat: 28.6230, lon: 77.2150},
    {id: "BIN003", lat: 28.6050, lon: 77.1950},
    {id: "BIN004", lat: 28.6180, lon: 77.2010},
    {id: "BIN005", lat: 28.6090, lon: 77.2180},
    {id: "BIN006", lat: 28.6280, lon: 77.1980}
];

let results = bins.map(b => {
    let existing = fleet[b.id];
    let fill = existing ? existing.Fill_Level : Math.floor(Math.random() * 20);
    let gas = existing ? existing.Methane_PPM : Math.floor(Math.random() * 100) + 50;
    let bat = existing ? existing.Battery_Level : 100;
    let temp = existing ? existing.Temperature : 30;

    // Simulate realistic small changes
    fill += Math.floor(Math.random() * 3); // Slowly fills up 0-2%
    if (fill > 100) fill = 0; // Truck empties it!
    
    gas += Math.floor(Math.random() * 20) - 10; // Gas fluctuates
    if (gas < 50) gas = 50;
    
    bat -= (Math.random() > 0.8 ? 1 : 0); // Battery drains slowly
    if (bat <= 0) bat = 100;

    temp += (Math.random() * 2) - 1; // Temp fluctuates slightly
    if (temp > 50) temp = 50;
    if (temp < 20) temp = 20;

    let status = "Normal";
    if(fill > 80) status = "Critical Full";
    else if(gas > 350) status = "Toxic Odor";
    else if(bat < 20) status = "Low Battery";
    else if(fill > 50) status = "Moderate";
    else status = "Empty";

    let newData = {
        Bin_ID: b.id,
        Latitude: b.lat + (Math.random() * 0.0004 - 0.0002), // Very small GPS drift
        Longitude: b.lon + (Math.random() * 0.0004 - 0.0002),
        Fill_Level: fill,
        Temperature: Math.round(temp * 10) / 10,
        Battery_Level: bat,
        Methane_PPM: gas,
        Timestamp: new Date().toISOString(),
        Status: status
    };
    fleet[b.id] = newData;
    return newData;
});

global.set('fleetData', fleet);
return [[ {payload: results[0]}, {payload: results[1]}, {payload: results[2]}, {payload: results[3]}, {payload: results[4]}, {payload: results[5]} ]];
"""

for node in data:
    if node.get("name") == "Generate Stable Bin Data" or node.get("id") == "dummy_gen":
        node["func"] = new_func

with open(path, 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=4)

print("Updated Node-RED dummy_gen function for realistic simulation.")
