# Use the slim version of Node.js
FROM node:20-slim

# Set working directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of your app
COPY . .

# Expose the development port
EXPOSE 7000

# Start in development mode
CMD ["npm", "run", "dev"]
