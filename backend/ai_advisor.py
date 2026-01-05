import os
import requests
from dotenv import load_dotenv

# 1. Load the variables from the .env file
load_dotenv()

# 2. Retrieve the API Key from the environment
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")

def get_contextual_advice(detected_object):
    """
    Sends the detected object name to Gemini (via OpenRouter) 
    and gets a professional advice response.
    """
    
    if not OPENROUTER_API_KEY:
        return "System Error: API Key missing in .env file."

    prompt = f"As an AI Traffic and Safety Advisor, I have just detected a '{detected_object}' on the road. Provide a one-sentence safety advice for a driver or city planner regarding this."

    try:
        response = requests.post(
            url="https://openrouter.ai/api/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "model": "google/gemini-2.0-flash-001",
                "messages": [
                    {"role": "user", "content": prompt}
                ]
            }
        )
        
        if response.status_code == 200:
            return response.json()['choices'][0]['message']['content']
        else:
            return f"Advisor currently unavailable (Error: {response.status_code})"
            
    except Exception as e:
        return f"Advice could not be generated: {str(e)}"