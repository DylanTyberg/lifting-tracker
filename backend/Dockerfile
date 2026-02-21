# 1️⃣ Use official Node.js LTS image (slim version for smaller size)
FROM node:20-slim

# 2️⃣ Set working directory inside container
WORKDIR /app

# 3️⃣ Copy package.json and package-lock.json first (better layer caching)
COPY package*.json ./

# 4️⃣ Install dependencies
RUN npm ci --only=production

# 5️⃣ Copy rest of the backend code
COPY . .

# 6️⃣ Expose the port your app will run on
EXPOSE 80

CMD ["node", "app.js"]