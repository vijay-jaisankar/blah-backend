from fastapi import FastAPI, Response, status


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
def get_details(item_id: str, response: Response, api_key: str = OMDB_API_KEY) -> Optional[dict]:
    # Call the OMDB API
    r = requests.get(f"http://www.omdbapi.com/?i={item_id}&apikey={api_key}")

    # Base case
    if r.status_code != 200:
        response.status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
        return {
            "error_message": "Server error"
        }
    
    # Get attributes
    json_description = r.json()

    if 'Error' in json_description:
        response.status_code = status.HTTP_404_NOT_FOUND
        return {
            "error_message": "Invalid ID passed"
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