FROM node:24-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json ./

# Install dependencies
RUN npm install

# Copy all project files
COPY . .

# Expose port
EXPOSE 3000

# Create database directory
RUN mkdir -p /app/database

# Start the server
CMD ["npm", "start"]

