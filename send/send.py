import requests
import json

# Define the JSON data to be sent in the POST request
data = {
    "message": """I have a cough"""
    # "count": 2
}

# Define the URL of the API endpoint
url = 'http://127.0.0.1:5000/fetch-response'

# Set the headers for the request (specifying content type as JSON)
headers = {
    "Content-Type": "application/json"
}

# Send POST request using requests library
try:
    response = requests.post(url, data=json.dumps(data), headers=headers)

    # Check the response status code
    if response.status_code == 200:
        print(response.text)
    else:
        print(f"POST request failed with status code: {response.status_code}")

except requests.exceptions.RequestException as e:
    print(f"Error occurred: {e}")