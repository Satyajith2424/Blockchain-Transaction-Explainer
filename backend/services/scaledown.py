import requests
from backend.config import Config

def optimize_explanation(text, mode):
    # If no API key, just return original text
    if not Config.SCALEDOWN_API_KEY:
        
        return {}, text

    try:
        payload = {
            "prompt": text
        }

        headers = {
            "Authorization": f"Bearer {Config.SCALEDOWN_API_KEY}",
            "Content-Type": "application/json"
        }

        response = requests.post(
            Config.SCALEDOWN_API_URL,
            json=payload,
            headers=headers,
            timeout=10
        )

        print("🔎 status code:", response.status_code)
        print("🔎 raw response:", response.text)

        if response.status_code == 200:
            data = response.json()

            # Try common fields
            for key in ["compressed_prompt", "text", "output", "result", "summary"]:
                if key in data and isinstance(data[key], str) and data[key].strip():
                    
                    return data, data[key]

        
        return {}, text

    except Exception as e:
        print("exception:", str(e))
        return {}, text
