from fastapi import FastAPI, Response, status


import os
from dotenv import load_dotenv
import requests
import time
import logging

logging.basicConfig(filename='./log/python_combined.log', filemode='a', format='%(name)s - %(levelname)s - %(message)s')



from helpers import execute_download_script, get_id_filename, get_random_ids, check_id_validity

# Environment variables
load_dotenv()
OMDB_API_KEY = os.getenv('OMDB_API_KEY')
FEED_LENGTH = int(os.getenv('FEED_LENGTH'))
FEED_PATH = os.getenv('FEED_PATH')



app = FastAPI()

"""
    Base route to check if the API is up
    Can be used as a prophylaxis by any services using this api
"""
@app.get("/")
def get_status():
    return {"status": "up ✓"}

"""
    Get details about a particular entry with IMDB ID
"""
@app.get("/details/{item_id}")
def get_details(item_id: str, response: Response, api_key: str = OMDB_API_KEY) -> dict:
    # Call the OMDB API
    r = requests.get(f"http://www.omdbapi.com/?i={item_id}&apikey={api_key}")

    # Base case
    if r.status_code != 200:
        logging.error("Get details - Non 200 status code while calling OMDB API")
        response.status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
        return {
            "error_message": "Server error"
        }
    
    # Get attributes
    try:
        json_description = r.json()

        if 'Error' in json_description:
            response.status_code = status.HTTP_404_NOT_FOUND
            logging.error("Get details - Invalid inputs")
            return {
                "error_message": "Invalid ID passed"
            } 
        
        if 'Title' in json_description:
            title = json_description['Title']
        else:
            title = "Untitled"
        if 'Poster' in json_description and json_description['Poster'] != "N/A":
            poster = json_description['Poster']
        else:
            poster = "https://i.imgur.com/oA0yD7d.png" # Default image

        # Return JSON
        logging.info(f"Get details - fetched for {item_id}")
        return {
            "id": item_id,
            "title": title,
            "poster" : poster
        }
    
    except Exception as e:
        # Invalid JSON as response due to invalid input
        logging.exception(f"Get details - Error {e}")
        response.status_code = status.HTTP_404_NOT_FOUND
        return {
                "error_message": "Invalid ID passed"
        } 

"""
    Check current validity of a given ID upto a 24 hour SLA
"""
@app.get("/valid/{item_id}")
def check_valid(item_id: str, response: Response, file_path: str = FEED_PATH, api_key: str = OMDB_API_KEY) -> dict:
    # Check for recent file
    ids_file = get_id_filename(file_path)

    if ids_file is None:
        logging.info("Check valid: Generating new IDs file due to timeout")
        current_status_code = execute_download_script(file_path.split("/")[-1])

        # Check for mutex lock
        while current_status_code != 0:
            logging.info("Check valid: Busy-wait cycle")
            time.sleep(2)
            current_status_code = execute_download_script(file_path.split("/")[-1])

    # Persistent error
    ids_file = get_id_filename(file_path)
    if ids_file is None:
        logging.error("Check valid: Persistent non-existence file error")
        response.status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
        return {
            "error_message": "Server error"
    }

    # Check from local file
    is_valid_flag = check_id_validity(ids_file, item_id)
    if is_valid_flag:
        return {
            "message": "valid"
        }
    else:
        return {
            "message": "invalid"
        }




"""
    Get a random selection of movies and TV shows that is recent upto a 24 hour SLA
"""
@app.get("/feed")
def get_feed(response: Response, k: int = FEED_LENGTH, file_path: str = FEED_PATH, api_key: str = OMDB_API_KEY) -> dict:
    # Keep track of time of execution
    start_time = time.time()

    # Check for recent file
    ids_file = get_id_filename(file_path)


    if ids_file is None:
        logging.info("Feed: Generating new IDs file due to timeout")
        current_status_code = execute_download_script(file_path.split("/")[-1])

        # Check for mutex lock
        while current_status_code != 0:
            logging.info("Feed: Busy-wait cycle")
            time.sleep(2)
            current_status_code = execute_download_script(file_path.split("/")[-1])

    # Persistent error
    ids_file = get_id_filename(file_path)
    if ids_file is None:
        response.status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
        return {
            "error_message": "Server error"
        }
    

    # If recent file exists, get random sample of the ids; if not, call the download script and use the generated file
    sample_ids = get_random_ids(ids_file, k)
    sample_ids = [x.replace("\n", "") for x in sample_ids]
    responses_json = [
        get_details(id, response, api_key) for id in sample_ids
    ]

    end_time = time.time()
    logging.info(f"Feed of length {k} generated in {end_time - start_time} ms")
    return {
        "feed" : responses_json
    }