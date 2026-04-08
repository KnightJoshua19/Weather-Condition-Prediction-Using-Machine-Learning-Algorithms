# Dockerfile for Waste Management Policy ML System
# Build: docker build -t waste-management-api .
# Run: docker run -p 5000:5000 waste-management-api

FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose port
EXPOSE 5000

# Set environment
ENV FLASK_APP=api_server.py
ENV FLASK_ENV=production

# Run the application
CMD ["python", "api_server.py"]
