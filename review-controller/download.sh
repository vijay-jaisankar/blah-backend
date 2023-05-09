<<comment
    This script downloads the movie details dump from the IMDB website.
    It then fishes out all of the IMDB IDs and pushes them into a txt file
comment

# Navigate into the target folder (supplied as an argument to the script)
mkdir -p $1
cd $1
TARGET=$(pwd)

# Download the tsv.gz archive into the target folder
rm -f *.gz *.txt
wget -q "https://datasets.imdbws.com/title.ratings.tsv.gz"

# Extract/Decompress the files
gzip -d title.ratings.tsv.gz

# Upgrade pip and install pandas
pip install -q --upgrade pip 
pip install -q pandas 

# Create the output file - ids_{UNIX_TIMESTAMP}.txt
now=$(date +%s)
touch ids_$now.txt

# Extract the IDs from the TSV file
cd -
/usr/bin/python3 read_ids.py --tsv $TARGET/title.ratings.tsv --out $TARGET/ids_$now.txt

# Count the number of lines written
printf "Number of titles: %s" "$(cat $TARGET/ids_$now.txt | wc -l)"