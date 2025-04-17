# Step 1: Define the base image
FROM node:18-alpine

# Step 2: Set the working directory
WORKDIR /app

# Step 3: Copy package.json and package-lock.json (or yarn.lock) files
COPY package*.json ./

# Step 4: Install dependencies
RUN npm install

# Step 5: Copy the rest of the application files
COPY . .

# Build TypeScript
RUN npm run build

# Step 6: Expose the app's port (optional)
EXPOSE 3000

# Step 7: Run the application
CMD ["npm", "run", "start"]
