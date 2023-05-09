"""
    Helper functions used in the details controller API.
"""
import subprocess
from typing import Optional
import os
import glob
import time


"""
    Execute the `download.sh` script and return the status code
"""
def execute_download_script(directory_name: str = "data") -> int:
    # Navigate to the `json-data` directory and run the download script
    os.chdir("./json-data/")
    script_execution = subprocess.run([f"./download.sh {directory_name}"], shell = True)

    # Navigate back to parent directory to aid in multiple calls
    os.chdir("../")

    # Return code
    return_code = script_execution.returncode
    return int(return_code)

"""
    Get the most recent file and check if 24 hours have elapsed since its creation
"""
def get_id_filename(directory_name: str = "data") -> Optional[str]:
    # Get current time stamp
    current_timestamp = int(time.time()) 

    # Get all txt files
    all_text_files = (glob.glob(f"./json-data/{directory_name}/*.txt"))

    # Base case
    if all_text_files is None or len(all_text_files) == 0:
        return None

    # Find the most recent file
    all_timestamps = [int(s.replace(".txt", "").split("_")[1]) for s in all_text_files]
    all_timestamps.sort(key = lambda x: current_timestamp - x)
    most_recent_file = all_timestamps[0]

    # Check if 24 hours have passed
    if current_timestamp - most_recent_file <= 86400:
        relative_filename = f"./json-data/{directory_name}/ids_{most_recent_file}.txt"
        return relative_filename
    
    return None