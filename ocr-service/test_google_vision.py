
import os
from dotenv import load_dotenv
from google.cloud import vision

load_dotenv()

credentials_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")

if not credentials_path or not os.path.exists(credentials_path):
    raise FileNotFoundError("Google credentials file not found.")

client = vision.ImageAnnotatorClient()

print("Google Vision client initialized successfully!")
