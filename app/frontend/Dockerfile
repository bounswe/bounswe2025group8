# ---- Build Stage ----
    FROM node:18-alpine AS build
    WORKDIR /app
    
    COPY package*.json ./
    RUN npm install
    
    COPY . .
    RUN npm run build
    
    # ---- Production Stage ----
    FROM caddy:2-alpine
    WORKDIR /usr/share/caddy
    
    COPY Caddyfile /etc/caddy/Caddyfile
    COPY --from=build /app/dist . 
    
    EXPOSE 80
    EXPOSE 443
    
    CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile"]