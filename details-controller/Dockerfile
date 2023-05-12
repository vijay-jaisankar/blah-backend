# Base image
FROM python:3.8

# Create a working directory
WORKDIR /app

# Install all deps
COPY REQUIREMENTS.txt .

#It will install the framework and the dependencies in the `REQUIREMENTS.txt` file.
RUN pip3 install -r REQUIREMENTS.txt

# Copy remaining files
COPY . .

# Expose port 8000
EXPOSE 8000

# Start and run the application container
CMD ["uvicorn", "main:app", "--host", "0.0.0.0"]