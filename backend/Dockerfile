# Backend Dockerfile
FROM python:3.11-slim

WORKDIR /app

# Set environment variables
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements file
COPY requirements.txt .

# Install Python dependencies
RUN pip install --upgrade pip && \
    pip install -r requirements.txt

# Copy application code
COPY server.py .
COPY app/ ./app/

# Create instance directory for database
RUN mkdir -p instance

# Create non-root user and switch to it (portable commands)
RUN groupadd -g 1000 appuser || true && \
    useradd -u 1000 -g appuser -M -s /usr/sbin/nologin appuser || true && \
    chown -R appuser:appuser /app

USER appuser

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --retries=3 --start-period=10s \
    CMD python -c "import socket; socket.create_connection(('127.0.0.1', 5000), timeout=2)" || exit 1

# Start the application
CMD ["python", "server.py"]
