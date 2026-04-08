# Build stage
FROM node:20-alpine as build-stage
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Production stage
FROM node:20-alpine as production-stage
WORKDIR /app
COPY package*.json ./
RUN npm install --only=production
COPY --from=build-stage /app/dist ./dist
# If you have static assets or uploads handled outside of Docker volumes
# COPY --from=build-stage /app/uploads ./uploads 

EXPOSE 3001
CMD ["node", "dist/index.js"]
