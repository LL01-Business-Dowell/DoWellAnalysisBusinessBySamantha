FROM python:3.11

# Set the working directory
WORKDIR /usr/src/app

# Install dependencies for Selenium & Chrome (with additional libraries)
RUN apt-get update --fix-missing && \
    apt-get install -y --no-install-recommends \
    wget curl unzip gnupg ca-certificates \
    fonts-liberation libasound2 libatk-bridge2.0-0 libatk1.0-0 \
    libatspi2.0-0 libcairo2 libcups2 libdbus-1-3 libdrm2 \
    libgbm1 libglib2.0-0 libgtk-3-0 libnspr4 libnss3 libwayland-client0 \
    libx11-6 libx11-xcb1 libxcb1 libxcb-dri3-0 libxcomposite1 \
    libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxkbcommon0 \
    libxrandr2 libxrender1 libxss1 libxtst6 xdg-utils && \
    rm -rf /var/lib/apt/lists/*

# Get latest stable Chrome version and install matching Chrome + ChromeDriver
RUN set -eux; \
    # Get the latest stable version
    CHROME_VERSION=$(curl -s "https://googlechromelabs.github.io/chrome-for-testing/last-known-good-versions-with-downloads.json" | \
    python3 -c "import sys, json; print(json.load(sys.stdin)['channels']['Stable']['version'])"); \
    echo "Using Chrome version: ${CHROME_VERSION}"; \
    \
    # Download and install Chrome
    wget -O /tmp/chrome-linux64.zip "https://storage.googleapis.com/chrome-for-testing-public/${CHROME_VERSION}/linux64/chrome-linux64.zip"; \
    unzip /tmp/chrome-linux64.zip -d /opt/; \
    ln -sf /opt/chrome-linux64/chrome /usr/local/bin/chrome; \
    \
    # Download and install matching ChromeDriver
    wget -O /tmp/chromedriver-linux64.zip "https://storage.googleapis.com/chrome-for-testing-public/${CHROME_VERSION}/linux64/chromedriver-linux64.zip"; \
    unzip /tmp/chromedriver-linux64.zip -d /opt/; \
    ln -sf /opt/chromedriver-linux64/chromedriver /usr/local/bin/chromedriver; \
    \
    # Cleanup
    rm /tmp/chrome-linux64.zip /tmp/chromedriver-linux64.zip; \
    \
    # Make executables and verify installation
    chmod +x /usr/local/bin/chrome /usr/local/bin/chromedriver; \
    \
    # Test Chrome installation
    /usr/local/bin/chrome --version || echo "Chrome test failed"; \
    /usr/local/bin/chromedriver --version || echo "ChromeDriver test failed"

# Create a non-root user for Chrome
RUN groupadd -r chrome && useradd -r -g chrome -G audio,video chrome \
    && mkdir -p /home/chrome && chown -R chrome:chrome /home/chrome

# Set environment variables
ENV GOOGLE_CHROME_BIN=/usr/local/bin/chrome
ENV CHROMEDRIVER_PATH=/usr/local/bin/chromedriver

# Copy requirements file
COPY requirements.txt /usr/src/app/requirements.txt

# Install Python dependencies
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy the rest of the Django app
COPY . /usr/src/app

# Create necessary directories with proper permissions
RUN mkdir -p /tmp/.X11-unix && chmod 1777 /tmp/.X11-unix && \
    mkdir -p /usr/src/app/logs && \
    chown -R chrome:chrome /usr/src/app

# Skip migrations in Docker build, run at startup instead
# RUN python manage.py makemigrations && python manage.py migrate

# Expose the port
EXPOSE 8000

# Switch to chrome user for running the application
USER chrome

# Start Django server with migrations at runtime
CMD ["sh", "-c", "python manage.py migrate --noinput && python manage.py runserver 0.0.0.0:8000"]