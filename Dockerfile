FROM node:20-alpine AS builder
WORKDIR /app
COPY frontend/package*.json ./frontend/
COPY backend/package*.json ./backend/
RUN cd frontend && npm install
RUN cd backend && npm install --omit=dev
COPY frontend/ ./frontend/
COPY backend/ ./backend/
RUN cd frontend && npm run build

FROM node:20-alpine
WORKDIR /app/backend
ENV NODE_ENV=production
COPY --from=builder /app/backend ./
EXPOSE 3000
CMD ["npm", "start"]

