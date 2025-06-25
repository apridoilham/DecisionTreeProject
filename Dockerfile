# Step 1: Start from the official Python 3.11 image
FROM python:3.11-slim

# Set the working directory in the container
WORKDIR /app

# Install system dependencies: graphviz (REQUIRED) and nodejs/npm (for Tailwind CSS)
RUN apt-get update && apt-get install -y graphviz nodejs npm

# Copy files required for dependency installation
COPY requirements.txt package.json package-lock.json* ./

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Install Node.js dependencies
RUN npm install

# Copy the entire project code into the container
COPY . .

# Run the Tailwind CSS build inside the container
RUN npm run build

# Inform the outside world that the container will run on port 10000
EXPOSE 10000

# Command to run the application using Gunicorn when the container starts
CMD ["gunicorn", "--bind", "0.0.0.0:10000", "app:app"]