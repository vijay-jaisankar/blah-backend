# Base image
FROM node:16-alpine

# Create a working directory
WORKDIR /app

# Install all deps
COPY package*.json .

# It will install the framework and the dependencies in the `package.json` file
RUN npm install 
RUN npm install bcrypt mocha 

# Copy remaining files
COPY . .

# Expose port 3000
EXPOSE 3000

# Start and run the application container
CMD yarn start
