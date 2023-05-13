<<comment
    This script downloads the movie details dump from the IMDB website.
    It then fishes out all of the IMDB IDs and pushes them into a txt file
comment

# Navigate into the target folder (supplied as an argument to the script)
mkdir -p $1
cd $1
TARGET=$(pwd)

# Download the tsv.gz archive into the target folder
rm -f *.gz *.tsv # Don't remove txt files so as to mitigate race conditions
wget -q "https://datasets.imdbws.com/title.ratings.tsv.gz"

# Extract/Decompress the files
gzip -d title.ratings.tsv.gz

# Create the output file - ids_{UNIX_TIMESTAMP}.txt
now=$(date +%s)
touch ids_$now.txt

# Find the python executable
python_exec=/usr/bin/python3

# Check if script is running inside a docker container
if grep -q docker /proc/1/cgroup; then 
   python_exec=/usr/local/bin/python3.8 
else
   python_exec=/usr/bin/python3
fi

# Check if script is running inside Render server
if [ ! -z "$RENDER" ]; then
   python_exec=python
else
   python_exec=/usr/bin/python3
fi

# Check if script is running inside Github actions server
if [ ! -z "$CI" ]; then
   python_exec=/opt/hostedtoolcache/Python/3.8.16/x64/bin/python
else
   python_exec=/usr/bin/python3
fi

# Extract the IDs from the TSV file
cd -
$python_exec read_ids.py --tsv $TARGET/title.ratings.tsv --out $TARGET/ids_$now.txt

# Count the number of lines written
printf "Number of titles: %s" "$(cat $TARGET/ids_$now.txt | wc -l)"