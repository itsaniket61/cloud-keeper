FROM node:lts-alpine

ENV NODE_ENV=production

WORKDIR /app

# Copy both package.json and package-lock.json (if exists)
COPY package*.json ./

COPY start.sh ./
RUN chmod +x start.sh

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

RUN chmod +x start.sh

# Build the application (if needed)
RUN npm run build

CMD ["sh","./start.sh"]