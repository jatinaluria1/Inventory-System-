FROM node:18-alpine

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

COPY . .

# Expose port for dev server
EXPOSE 5173

# We will run the vite dev server by default for local development.
# The docker-compose maps volumes to this, so changes reflect live.
CMD ["npm", "run", "dev", "--", "--host"]
