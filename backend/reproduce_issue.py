import requests

try:
    print("Testing GET http://localhost:8000/job-roles...")
    response = requests.get("http://localhost:8000/job-roles", headers={"Accept": "application/json"})
    
    print(f"Status Code: {response.status_code}")
    print(f"Headers: {response.headers}")
    print(f"Content-Type: {response.headers.get('Content-Type')}")
    print(f"Text Preview: {response.text[:200]}")
    
    if response.status_code == 406:
        print("\nCONFIRMED: Server returned 406 Not Acceptable.")
    elif response.status_code == 200:
        print("\nSUCCESS: Server returned 200 OK.")
    else:
        print(f"\nResult: Server returned {response.status_code}")

except Exception as e:
    print(f"\nCRITICAL ERROR: Failed to connect. {e}")
