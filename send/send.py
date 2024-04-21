import requests
import json

# Define the JSON data to be sent in the POST request
data = {
    "message": """I have a cough""",
    "pastUrls": ["https://www.reddit.com/r/AskDocs/comments/nwz3od/i_have_to_cough_for_some_reason", "https://www.reddit.com/r/AskDocs/comments/zih3gl/i_have_an_annoying_cough"],
    "count": 1
}

# Define the URL of the API endpoint
url = 'http://18.224.93.12:5000/fetch-response'

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