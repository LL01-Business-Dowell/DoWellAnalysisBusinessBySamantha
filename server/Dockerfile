# Use full Debian-based image (not slim)
FROM python:3.11

# Set the working directory
WORKDIR /usr/src/app

# Install dependencies for Selenium & Chrome
RUN apt-get update --fix-missing && \
    apt-get install -y --no-install-recommends -f \
    wget curl unzip gnupg \
    libx11-6 libxcb1 libxcomposite1 libxdamage1 libxext6 libxfixes3 \
    libxkbcommon0 libxrandr2 xdg-utils libglib2.0-0 libnss3 libgconf-2-4 \
    libx11-xcb1 libxcursor1 libxi6 libxrender1 libdbus-glib-1-2 libgtk-3-0 && \
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
    ln -s /opt/chrome-linux64/chrome /usr/local/bin/chrome; \
    \
    # Download and install matching ChromeDriver
    wget -O /tmp/chromedriver-linux64.zip "https://storage.googleapis.com/chrome-for-testing-public/${CHROME_VERSION}/linux64/chromedriver-linux64.zip"; \
    unzip /tmp/chromedriver-linux64.zip -d /opt/; \
    ln -s /opt/chromedriver-linux64/chromedriver /usr/local/bin/chromedriver; \
    \
    # Cleanup
    rm /tmp/chrome-linux64.zip /tmp/chromedriver-linux64.zip; \
    \
    # Make executables
    chmod +x /usr/local/bin/chrome /usr/local/bin/chromedriver

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

# Run migrations
RUN python manage.py makemigrations && python manage.py migrate

# Expose the port
EXPOSE 8000

# Start Django server
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]