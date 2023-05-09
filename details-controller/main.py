from fastapi import FastAPI
from typing import Optional
import os
from dotenv import load_dotenv
import requests

# Environment variables
load_dotenv()
OMDB_API_KEY = os.getenv('OMDB_API_KEY')



app = FastAPI()

"""
    Base route to check if the API is up
    Can be used as a prophylaxis by any services using this api
"""
@app.get("/status")
def get_status():
    return {"status": "up ✓"}

"""
    Get details about a particular entry with IMDB ID
"""
@app.get("/details/{item_id}")
def get_details(item_id: str, api_key: str = OMDB_API_KEY) -> Optional[dict]:
    # Call the OMDB API
    r = requests.get(f"http://www.omdbapi.com/?i={item_id}&apikey={api_key}")

    # Base case
    if r.status_code != 200:
        return {
            "error_message": "Server error or invalid ID passed"
        }
    
    # Get attributes
    json_description = r.json()

    if 'Error' in json_description:
        return {
            "error_message": "Server error or invalid ID passed"
        } 
    
    if 'Title' in json_description:
        title = json_description['Title']
    else:
        title = "Untitled"
    if 'Poster' in json_description:
        poster = json_description['Poster']
    else:
        poster = "https://i.imgur.com/oA0yD7d.png" # Default image

    # Return JSON
    return {
        "id": item_id,
        "title": title,
        "poster" : poster
    }