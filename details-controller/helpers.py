"""
    Helper functions used in the details controller API.
"""
import subprocess
from typing import Optional, List
import os
import glob
import time
import random


"""
    Execute the `download.sh` script and return the status code
"""
def execute_download_script(directory_name: str = "data") -> int:
    # Navigate to the `json-data` directory and run the download script
    os.chdir("./json-data/")

    # Generate lock file
    subprocess.run(["touch sample.lock"], shell = True)

    # Run the script with `flock` command
    script_execution = subprocess.run([f'flock sample.lock --command "./download.sh {directory_name}"'], shell = True)

    # Navigate back to parent directory to aid in multiple calls
    os.chdir("../")

    # Return code
    return_code = script_execution.returncode
    return int(return_code)

"""
    Get the most recent file and check if 24 hours have elapsed since its creation
"""
def get_id_filename(directory_name: str = "./json-data/data") -> Optional[str]:
    # Get current time stamp
    current_timestamp = int(time.time()) 

    # Get all txt files
    all_text_files = (glob.glob(f"{directory_name}/*.txt"))

    # Base case
    if all_text_files is None or len(all_text_files) == 0:
        return None

    # Find the most recent file
    all_timestamps = [int(s.replace(".txt", "").split("_")[1]) for s in all_text_files]
    all_timestamps.sort(key = lambda x: current_timestamp - x)
    most_recent_file = all_timestamps[0]

    # Check if 24 hours have passed
    if current_timestamp - most_recent_file <= 86400:
        relative_filename = f"{directory_name}/ids_{most_recent_file}.txt"
        return relative_filename
    
    return None

"""
    Read the ID file and select k random IDs, where k is a parameter passed to the function
"""
def get_random_ids(filename: str, k: int) -> Optional[List[str]]:
    # Base case
    if filename is None or k <= 0:
        return None 
    
    # Read the file
    all_ids = []
    with open(filename, "r") as f:
        for line in f.readlines():
            all_ids.append(line)

    # Get k IDs
    random_samples = random.sample(all_ids, k = k)

    return random_samples


"""
    Read the ID file and select the k highest IDs, where k is a parameter passed to the function
"""
def get_highest_ids(filename: str, k: int) -> Optional[List[str]]:
    # Base case
    if filename is None or k <= 0:
        return None 
    
    # Read the file
    all_ids = []
    with open(filename, "r") as f:
        for line in f.readlines():
            all_ids.append(line)

    # Get k IDs
    all_ids.sort()
    samples = all_ids[-k:]

    return samples

"""
    Read the ID file and check if the given ID exists
"""
def check_id_validity(filename: str, given_id: str) -> bool:
    # Base case
    if filename is None or given_id is None or filename == "" or given_id == "":
        return False
    
    # Read the file
    with open(filename, "r") as f:
        for line in f.readlines():
            target_id = line.replace("\n","")
            if target_id == given_id:
                return True
            
    return False