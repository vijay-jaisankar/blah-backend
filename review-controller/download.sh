<<comment
    This script downloads the movie details dump from the IMDB website
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