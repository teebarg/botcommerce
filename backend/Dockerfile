FROM python:3.11-slim-buster as builder

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Create and set the working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    libffi-dev \
    python3-dev \
    libssl-dev

# Copy the requirements.txt file to the container
COPY requirements.base.txt .
COPY requirements.dev.txt .

# Install the project dependencies
RUN pip install -r requirements.dev.txt

# Install uvicorn explicitly
RUN pip install uvicorn

# Copy the entire project to the container's working directory
COPY . .

# Expose port 8000 (the port your FastAPI app is listening on)
EXPOSE 8000

# Copy your Bash script into the container
COPY prestart.sh /usr/local/bin/
COPY test.sh /usr/local/bin/

# Make the script executable (if needed)
RUN chmod +x /usr/local/bin/prestart.sh
RUN chmod +x /usr/local/bin/test.sh

# Run your existing command and then the Bash script
CMD ["sh", "-c", "/usr/local/bin/prestart.sh && python -m uvicorn main:app --host 0.0.0.0 --reload"]
