"""
    Helper script to read the IMDB TSV file and extract all of the IDs
"""

import pandas as pd
import argparse
from typing import List

def get_all_ids(tsv_path:str) -> List[str]:
    df = pd.read_csv(tsv_path, sep = "\t")
    ids = df["tconst"]
    return list(ids)

def save_all_ids(ids: List[str], out_path:str) -> None:
    with open(out_path, "w") as f:
        for movie in ids:
            f.write(f"{movie}\n")

if __name__ == "__main__":
    try:
        parser = argparse.ArgumentParser()
        parser.add_argument("--tsv", default = "./temp/title.ratings.tsv", help="Path to the extracted tsv file.", required = False)
        parser.add_argument("--out", default = "./temp/ids.txt", help = "Path of the file where the processed IDs are to be saved.", required = False)
        args = parser.parse_args()

        ids = get_all_ids(args.tsv)
        save_all_ids(ids, args.out)
    except Exception as e:
        print(f"Error: {e}")