# frontend/Dockerfile
FROM node:18

# Set working directory
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm install

# Copy app code
COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]

