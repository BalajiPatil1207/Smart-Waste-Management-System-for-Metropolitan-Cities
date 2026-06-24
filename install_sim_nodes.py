import json
import os
import shutil

repo_flows_path = r"d:\Desktop\MERN_FULL_STACK\Smart Waste Management System for Metropolitan Cities\node_red\flow.json"
user_flows_path = r"C:\Users\Balaji\.node-red\flows.json"

def main():
    print("======================================================")
    print(" Installing Telemetry API Nodes to Node-RED...")
    print("======================================================")
    
    if not os.path.exists(repo_flows_path):
        print(f"[ERROR] Repository flow.json not found at: {repo_flows_path}")
        return
        
    try:
        # Load local repo flows
        with open(repo_flows_path, 'r', encoding='utf-8') as f:
            repo_flows = json.load(f)
            
        print(f"[INFO] Loaded {len(repo_flows)} nodes from repository flow.json.")
        
        # Backup the current active user flows
        if os.path.exists(user_flows_path):
            backup_path = user_flows_path + ".bak"
            shutil.copy2(user_flows_path, backup_path)
            print(f"[SUCCESS] Created backup of current active flows at: {backup_path}")
            
            # Read existing active flows to see if we should merge or override
            with open(user_flows_path, 'r', encoding='utf-8') as f:
                user_flows = json.load(f)
            
            # We want to replace/update the nodes that have the same ID from repository
            # Find and update, or append if not present
            user_flow_dict = {node.get('id'): node for node in user_flows if node.get('id')}
            
            inserted = 0
            updated = 0
            for node in repo_flows:
                node_id = node.get('id')
                if not node_id:
                    continue
                if node_id in user_flow_dict:
                    # Update
                    idx = next(i for i, n in enumerate(user_flows) if n.get('id') == node_id)
                    user_flows[idx] = node
                    updated += 1
                else:
                    # Append
                    user_flows.append(node)
                    inserted += 1
                    
            print(f"[INFO] Synced flows: {updated} updated, {inserted} inserted.")
        else:
            # If no flows.json exists, write the whole repository file
            os.makedirs(os.path.dirname(user_flows_path), exist_ok=True)
            user_flows = repo_flows
            print(f"[INFO] No flows.json found at target. Creating new flows.json with repository template.")

        # Save to user flows path
        with open(user_flows_path, 'w', encoding='utf-8') as f:
            json.dump(user_flows, f, indent=4)
            
        print(f"[SUCCESS] Successfully updated active Node-RED flows at: {user_flows_path}")
        print("Please restart Node-RED or deploy the changes inside Node-RED UI to load the new API endpoint!")
        
    except Exception as e:
        print(f"[ERROR] Failed to update flows: {e}")

if __name__ == "__main__":
    main()
