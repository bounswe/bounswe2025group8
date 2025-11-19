# --- Build Stage ---
    FROM node:18-alpine AS build
    WORKDIR /app
    
    COPY package*.json ./
    RUN npm install
    
    COPY . .
    RUN npm run build
    
    # Build output: /app/dist