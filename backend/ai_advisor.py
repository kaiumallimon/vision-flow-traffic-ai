import os
from openai import OpenAI
from dotenv import load_dotenv

# Load the .env file from the parent directory
load_dotenv()

# DEBUG: This will print in your terminal so you can see if the key is loading
api_key = os.getenv("OPENROUTER_API_KEY")
if not api_key:
    print("❌ ERROR: OPENROUTER_API_KEY not found in .env file!")
else:
    print("✅ API Key loaded successfully.")

client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=api_key, # Use the variable we just checked
)

def get_contextual_advice(label: str):
    if label == "Nothing detected":
        return "System ready. No objects currently requiring advice."

    try:
        response = client.chat.completions.create(
            model="google/gemini-2.0-flash-001",
            messages=[
                {"role": "system", "content": "You are a safety assistant. Give a 10-word safety tip for the object."},
                {"role": "user", "content": f"Object: {label}"}
            ]
        )
        return response.choices[0].message.content
    except Exception as e:
        return f"Advice error: {str(e)}"