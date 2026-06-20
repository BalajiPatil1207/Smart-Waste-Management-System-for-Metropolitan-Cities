import json

path = r"C:\Users\Balaji\.node-red\flows.json"
with open(path, 'r', encoding='utf-8') as f:
    data = json.load(f)

bad_types = ['cloudant', 'cloudant out', 'mqtt-broker', 'mqtt in']
cleaned = [n for n in data if n.get('type') not in bad_types]

with open(path, 'w', encoding='utf-8') as f:
    json.dump(cleaned, f, indent=4)

print(f"Cleaned {len(data) - len(cleaned)} nodes.")
