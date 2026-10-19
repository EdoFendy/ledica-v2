FROM node:22-slim
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ && rm -rf /var/lib/apt/lists/*
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
ENV NODE_ENV=production DATA_DIR=/data PORT=3000
VOLUME /data
EXPOSE 3000
# al primo avvio popola il database dal vecchio sito; dopo non tocca nulla
CMD ["sh", "-c", "npx tsx scripts/seed.ts && npx next start -p 3000"]
