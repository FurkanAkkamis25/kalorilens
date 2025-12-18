FROM node:18

WORKDIR /app

# Dependency caching
COPY package*.json ./
RUN npm install

# Copy source
COPY . .

# Generate Prisma Client (Needs dummy env for validation)
ENV DATABASE_URL="postgresql://dummy:5432/dummy"
RUN npx prisma generate

# Build
RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start:prod"]
