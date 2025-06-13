import os
import time
import random
import tempfile
import uuid
import shutil
import re
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager

def clean_text(text):
    """Clean and normalize text extracted from web elements"""
    if not text or text == "N/A":
        return "N/A"
    
    # Remove extra whitespace, newlines, and special characters
    text = str(text).strip()
    text = re.sub(r'\s+', ' ', text)  # Replace multiple spaces with single space
    text = re.sub(r'[\n\r\t]', ' ', text)  # Replace newlines/tabs with space
    text = text.replace('\u200b', '')  # Remove zero-width space
    text = text.replace('\u00a0', ' ')  # Replace non-breaking space
    
    return text.strip()

def extract_lat_lng(driver):
    """Extract latitude and longitude from Google Maps URL"""
    try:
        current_url = driver.current_url
        
        # Method 1: Extract from URL parameters
        lat_lng_pattern = r'@(-?\d+\.\d+),(-?\d+\.\d+)'
        match = re.search(lat_lng_pattern, current_url)
        
        if match:
            latitude = float(match.group(1))
            longitude = float(match.group(2))
            return latitude, longitude
        
        # Method 2: Extract from URL after /place/
        place_pattern = r'/place/[^/@]+/@(-?\d+\.\d+),(-?\d+\.\d+)'
        match = re.search(place_pattern, current_url)
        
        if match:
            latitude = float(match.group(1))
            longitude = float(match.group(2))
            return latitude, longitude
        
        # Method 3: Try to find coordinates in page source
        try:
            page_source = driver.page_source
            coord_pattern = r'"(-?\d+\.\d+),(-?\d+\.\d+)"'
            matches = re.findall(coord_pattern, page_source)
            
            for lat_str, lng_str in matches:
                lat, lng = float(lat_str), float(lng_str)
                # Basic validation - coordinates should be reasonable
                if -90 <= lat <= 90 and -180 <= lng <= 180:
                    return lat, lng
        except Exception:
            pass
        
        # Method 4: Try JavaScript execution to get coordinates
        try:
            coords = driver.execute_script("""
                var url = window.location.href;
                var match = url.match(/@(-?\\d+\\.\\d+),(-?\\d+\\.\\d+)/);
                if (match) {
                    return {lat: parseFloat(match[1]), lng: parseFloat(match[2])};
                }
                return null;
            """)
            
            if coords and 'lat' in coords and 'lng' in coords:
                return coords['lat'], coords['lng']
        except Exception:
            pass
        
        return "N/A", "N/A"
        
    except Exception as e:
        print(f"Error extracting coordinates: {e}")
        return "N/A", "N/A"

def get_google_maps_details(url):
    """Extract business details from Google Maps URL"""
    # Create unique user data directory
    temp_dir = tempfile.mkdtemp()
    user_data_dir = os.path.join(temp_dir, f"chrome_user_data_{uuid.uuid4().hex}")
    
    options = webdriver.ChromeOptions()
    
    # Critical arguments for Docker stability
    options.add_argument("--headless=new")  # Use new headless mode
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--disable-gpu")
    options.add_argument("--disable-software-rasterizer")
    options.add_argument("--disable-background-timer-throttling")
    options.add_argument("--disable-backgrounding-occluded-windows")
    options.add_argument("--disable-renderer-backgrounding")
    options.add_argument("--disable-features=TranslateUI")
    options.add_argument("--disable-ipc-flooding-protection")
    options.add_argument("--disable-client-side-phishing-detection")
    options.add_argument("--disable-crash-reporter")
    options.add_argument("--disable-oopr-debug-crash-dump")
    options.add_argument("--no-crash-upload")
    options.add_argument("--disable-extensions")
    options.add_argument("--disable-plugins")
    options.add_argument("--disable-add-to-shelf")
    options.add_argument("--disable-background-downloads")
    options.add_argument("--disable-webgl")
    options.add_argument("--disable-threaded-animation")
    options.add_argument("--disable-threaded-scrolling")
    options.add_argument("--disable-in-process-stack-traces")
    options.add_argument("--disable-histogram-customizer")
    options.add_argument("--disable-gl-extensions")
    options.add_argument("--disable-composited-antialiasing")
    options.add_argument("--disable-canvas-aa")
    options.add_argument("--disable-3d-apis")
    options.add_argument("--disable-accelerated-2d-canvas")
    options.add_argument("--disable-accelerated-jpeg-decoding")
    options.add_argument("--disable-accelerated-mjpeg-decode")
    options.add_argument("--disable-app-list-dismiss-on-blur")
    options.add_argument("--disable-accelerated-video-decode")
    options.add_argument("--num-raster-threads=1")
    options.add_argument("--enable-tcp-fast-open")
    options.add_argument("--window-size=1366,768")  # Smaller window size
    options.add_argument("--memory-pressure-off")
    options.add_argument("--max_old_space_size=4096")
    
    # Additional stability options
    options.add_argument("--no-first-run")
    options.add_argument("--no-default-browser-check")
    options.add_argument("--disable-logging")
    options.add_argument("--disable-permissions-api")
    options.add_argument("--disable-notifications")
    options.add_argument("--disable-web-security")
    options.add_argument("--allow-running-insecure-content")
    options.add_argument("--ignore-certificate-errors")
    options.add_argument("--ignore-ssl-errors")
    options.add_argument("--ignore-certificate-errors-spki-list")
    options.add_argument("--remote-debugging-port=9222")
    
    # User data directory
    options.add_argument(f"--user-data-dir={user_data_dir}")
    
    # Set Chrome binary location
    chrome_binary = os.environ.get('GOOGLE_CHROME_BIN', '/usr/local/bin/chrome')
    options.binary_location = chrome_binary
    
    driver = None
    try:
        # Use environment variable for ChromeDriver
        chromedriver_path = os.environ.get('CHROMEDRIVER_PATH', '/usr/local/bin/chromedriver')
        service = Service(chromedriver_path)
        
        # Add service arguments for stability
        service.creation_flags = 0
        
        driver = webdriver.Chrome(service=service, options=options)
        
        # Set timeouts
        driver.set_page_load_timeout(30)
        driver.implicitly_wait(10)
        
        # Random delay before navigation
        time.sleep(random.randint(1, 3))
        
        print(f"Navigating to URL: {url}")
        driver.get(url)
        
        # Wait for page to load completely
        time.sleep(5)
        
        # Wait for the main element with shorter timeout to avoid hanging
        try:
            WebDriverWait(driver, 15).until(
                EC.presence_of_element_located((By.XPATH, "//h1[contains(@class, 'DUwDvf')]"))
            )
        except Exception as e:
            print(f"Element wait timeout: {e}")
            # Try to continue anyway
        
        # Check if driver is still responsive
        if not driver.session_id:
            raise Exception("Driver session is no longer valid")
        
        latitude, longitude = extract_lat_lng(driver)

        # Helper function for safe element extraction
        def safe_get_text(xpath):
            try:
                elements = driver.find_elements(By.XPATH, xpath)
                if elements and driver.session_id:
                    return clean_text(elements[0].text)
                return "N/A"
            except Exception as e:
                print(f"Error getting text for {xpath}: {e}")
                return "N/A"
        
        def safe_get_attribute(xpath, attribute):
            try:
                elements = driver.find_elements(By.XPATH, xpath)
                if elements and driver.session_id:
                    return clean_text(elements[0].get_attribute(attribute))
                return "N/A"
            except Exception as e:
                print(f"Error getting attribute for {xpath}: {e}")
                return "N/A"

        details = {
            "URL": url,
            "Name": safe_get_text("//h1[contains(@class, 'DUwDvf')]"),
            "Address": safe_get_text("//button[@data-tooltip='Copy address']"),
            "Phone": safe_get_text("//button[@data-tooltip='Copy phone number']"),
            "Rating": safe_get_text("//span[@class='MW4etd']"),
            "Reviews": safe_get_text("//span[@class='UY7F9']"),
            "Plus Code": safe_get_text("//button[@data-tooltip='Copy plus code']"),
            "Website": safe_get_attribute("//a[contains(@aria-label, 'Visit') or contains(@href, 'http')]", "href"),
            "Latitude": latitude,
            "Longitude": longitude
        }

        return {
            "success": True,
            "message": "Data retrieved successfully",
            "data": details
        }

    except Exception as e:
        error_message = str(e)
        print(f"Chrome error: {error_message}")
        return {
            "success": False,
            "message": f"Error fetching business info: {error_message}"
        }

    finally:
        # Clean up driver with error handling
        if driver:
            try:
                if driver.session_id:
                    driver.quit()
            except Exception as e:
                print(f"Error closing driver: {e}")
                # Force kill if needed
                try:
                    driver.service.process.kill()
                except:
                    pass
        
        # Clean up temporary directory
        try:
            shutil.rmtree(temp_dir, ignore_errors=True)
        except Exception as e:
            print(f"Error cleaning up temp directory: {e}")


# Lightweight version with minimal arguments (alternative)
def get_google_maps_details_lightweight(url):
    """Lightweight version with minimal Chrome arguments"""
    user_data_dir = f"/tmp/chrome_data_{os.getpid()}_{int(time.time() * 1000)}"
    
    options = webdriver.ChromeOptions()
    
    # Minimal essential arguments only
    options.add_argument("--headless=new")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--disable-gpu")
    options.add_argument("--window-size=1366,768")
    options.add_argument("--disable-extensions")
    options.add_argument("--disable-logging")
    options.add_argument("--no-first-run")
    options.add_argument(f"--user-data-dir={user_data_dir}")
    
    chrome_binary = os.environ.get('GOOGLE_CHROME_BIN', '/usr/local/bin/chrome')
    options.binary_location = chrome_binary
    
    driver = None
    try:
        chromedriver_path = os.environ.get('CHROMEDRIVER_PATH', '/usr/local/bin/chromedriver')
        service = Service(chromedriver_path)
        
        driver = webdriver.Chrome(service=service, options=options)
        driver.set_page_load_timeout(20)
        
        time.sleep(random.randint(1, 2))
        driver.get(url)
        time.sleep(3)
        
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.XPATH, "//h1[contains(@class, 'DUwDvf')]"))
        )
        
        latitude, longitude = extract_lat_lng(driver)

        details = {
            "URL": url,
            "Name": clean_text(driver.find_element(By.XPATH, "//h1[contains(@class, 'DUwDvf')]").text),
            "Address": clean_text(driver.find_element(By.XPATH, "//button[@data-tooltip='Copy address']").text if driver.find_elements(By.XPATH, "//button[@data-tooltip='Copy address']") else "N/A"),
            "Phone": clean_text(driver.find_element(By.XPATH, "//button[@data-tooltip='Copy phone number']").text if driver.find_elements(By.XPATH, "//button[@data-tooltip='Copy phone number']") else "N/A"),
            "Rating": clean_text(driver.find_element(By.XPATH, "//span[@class='MW4etd']").text if driver.find_elements(By.XPATH, "//span[@class='MW4etd']") else "N/A"),
            "Reviews": clean_text(driver.find_element(By.XPATH, "//span[@class='UY7F9']").text if driver.find_elements(By.XPATH, "//span[@class='UY7F9']") else "N/A"),
            "Plus Code": clean_text(driver.find_element(By.XPATH, "//button[@data-tooltip='Copy plus code']").text if driver.find_elements(By.XPATH, "//button[@data-tooltip='Copy plus code']") else "N/A"),
            "Website": clean_text(driver.find_element(By.XPATH, "//a[contains(@aria-label, 'Visit') or contains(@href, 'http')]").get_attribute("href") if driver.find_elements(By.XPATH, "//a[contains(@aria-label, 'Visit') or contains(@href, 'http')]") else "N/A"),
            "Latitude": latitude,
            "Longitude": longitude
        }

        return {
            "success": True,
            "message": "Data retrieved successfully",
            "data": details
        }

    except Exception as e:
        return {
            "success": False,
            "message": f"Error fetching business info: {str(e)}"
        }

    finally:
        if driver:
            try:
                driver.quit()
            except:
                pass
        
        try:
            if os.path.exists(user_data_dir):
                shutil.rmtree(user_data_dir, ignore_errors=True)
        except:
            pass