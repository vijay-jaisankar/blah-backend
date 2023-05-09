<<comment
    This script tests the functionality of the download.sh script.
    It runs the script, checks if there is a (non-empty) .txt file and then cleans up.
comment

# Make the script an executable.
chmod +x download.sh

# Temporary directory
mkdir -p temp_json_directory/
./download.sh temp_json_directory

# Check for a non-empty .txt file
cd temp_json_directory
txt_file=$(ls -ABrt1 --group-directories-first *.txt | tail -n1)

lines=$(cat $txt_file | wc -l)
target=0


echo ""
if [ "$lines" -gt "$target" ]; 
then
    echo "test script success";
else
    echo "test script failure";
fi

# Remove the newly-created directory
cd ../
rm -rf temp_json_directory/