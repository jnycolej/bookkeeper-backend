# Use the official Node.js LTS image
FROM node:18

# Create and set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the backend code
COPY . .

# Expose the port your backend listens on
EXPOSE 5000

# Start the backend application
CMD ["npm", "run", "dev"]
