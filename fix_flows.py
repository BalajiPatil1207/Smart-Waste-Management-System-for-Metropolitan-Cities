import json

filepaths = [
    r'd:\Desktop\MERN_FULL_STACK\Smart Waste Management System for Metropolitan Cities\node_red\flow.json',
    r'C:\Users\Balaji\.node-red\flows.json'
]

for filepath in filepaths:
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        for node in data:
            if node.get('cloudant') == 'sensor_cloudant_cfg':
                node['cloudant'] = 'dummy_cloudant_cfg'
            if node.get('id') == 'sensor_cloudant_cfg':
                node['id'] = 'dummy_cloudant_cfg'
            
            if node.get('name') == 'SMS Alert Trigger' and node.get('type') == 'function':
                node['func'] = node['func'].replace(
                    'msg.headers = {',
                    'if("YOUR_FAST2SMS_API_KEY" === "YOUR_FAST2SMS_API_KEY") return null;\n    msg.headers = {'
                )
        
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=4)
        print(f'Fixed {filepath}')
    except Exception as e:
        print(f'Error fixing {filepath}: {e}')
