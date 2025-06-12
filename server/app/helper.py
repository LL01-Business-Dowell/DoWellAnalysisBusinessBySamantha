import json
import requests
import pprint
import uuid
import time
import random
import re
import json
import os
import csv
import os
import time
import random
import tempfile
import uuid
import shutil
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager
# from google import genai
import google.generativeai as genai


"""Dowell Mail API services"""
def send_email(toname,toemail,subject,email_content):
    url = "https://100085.pythonanywhere.com/api/email/"
    payload = {
        "toname": toname,
        "toemail": toemail,
        "subject": subject,
        "email_content":email_content
    }
    response = requests.post(url, json=payload)
    return response.text


"""DoWell Product Experienced Service"""
def experience_database_services(email, occurrences):
    url = "https://100105.pythonanywhere.com/api/v3/experience_database_services/?type=experienced_service_user_details"
    payload = {
        "email":email,
        "product_number":"UXLIVINGLAB010",
        "occurrences":occurrences
    }
    response = requests.post(url, json=payload)
    return response.text


def experience_database_services_linkedin(email, occurrences):
    url = "https://100105.pythonanywhere.com/api/v3/experience_database_services/?type=experienced_service_user_details"
    payload = {
        "email":email,
        "product_number":"UXLIVINGLAB011",
        "occurrences":occurrences
    }
    response = requests.post(url, json=payload)
    return response.text


def save_experienced_product_data(product_name,email,experienced_data):
    url = "https://100105.pythonanywhere.com/api/v3/experience_database_services/?type=experienced_user_details"
    payload = {
        "product_name": product_name,
        "email": email,
        "experienced_data": experienced_data
    }
    response = requests.post(url, json=payload)
    return response.text


def update_user_usage(email, occurrences):
    url = f"https://100105.pythonanywhere.com/api/v3/experience_database_services/?type=update_user_usage&product_number=UXLIVINGLAB010&email={email}&occurrences={occurrences}"
    response = requests.get(url)
    return response.text

# DOWELL BUSINESS ANALYSIS

def experience_database_services_google_reviews(email, occurrences):
    url = "https://100105.pythonanywhere.com/api/v3/experience_database_services/?type=experienced_service_user_details"
    payload = {
        "email":email,
        "product_number":"UXLIVINGLAB012",
        "occurrences":occurrences
    }
    response = requests.post(url, json=payload)
    return response.text

def clean_text(text):
    if text:
        text = re.sub(r"[^\x20-\x7E]", "", text)
        return text.strip()
    return "N/A"
def extract_lat_lng(driver):
    try:
        url = driver.current_url
        match = re.search(r"@(-?\d+\.\d+),(-?\d+\.\d+),", url)
        if match:
            return match.group(1), match.group(2)
    except:
        pass
    return "N/A", "N/A"

# def get_google_maps_details(url):
#     options = webdriver.ChromeOptions()
#     options.add_argument("--headless")
#     options.add_argument("--disable-gpu")
#     options.add_argument("--no-sandbox")
#     chrome_binary_path = os.environ.get('GOOGLE_CHROME_BIN') # Get from ENV
#     if not chrome_binary_path:
#         chrome_binary_path = "/usr/bin/google-chrome"
#     options.binary_location = chrome_binary_path
#     # options.setBinary(chrome_binary_path);
#     # chrome_driver = 
#     chromedriver_path = os.environ.get('CHROMEDRIVER_PATH') # Get from ENV
#     if not chromedriver_path:
#         # Fallback in case the ENV var isn't set correctly in your environment when running (less likely in Docker if Dockerfile is correct)
#         chromedriver_path = "/usr/local/bin/chromedriver" 
#     # service = Service(ChromeDriverManager().install())
#     service = Service(chromedriver_path)
    
#     driver = webdriver.Chrome(service=service, options=options)

#     try:
#         delay = random.randint(3, 7)
#         print(f"Waiting {delay} seconds before opening URL: {url}")
#         time.sleep(delay)

#         driver.get(url)
#         time.sleep(5)

#         latitude, longitude = extract_lat_lng(driver)

#         details = {
#             "URL": url,
#             "Name": clean_text(driver.find_element(By.XPATH, "//h1[contains(@class, 'DUwDvf')]").text if driver.find_elements(By.XPATH, "//h1[contains(@class, 'DUwDvf')]") else "N/A"),
#             "Address": clean_text(driver.find_element(By.XPATH, "//button[@data-tooltip='Copy address']").text if driver.find_elements(By.XPATH, "//button[@data-tooltip='Copy address']") else "N/A"),
#             "Phone": clean_text(driver.find_element(By.XPATH, "//button[@data-tooltip='Copy phone number']").text if driver.find_elements(By.XPATH, "//button[@data-tooltip='Copy phone number']") else "N/A"),
#             "Rating": clean_text(driver.find_element(By.XPATH, "//span[@class='MW4etd']").text if driver.find_elements(By.XPATH, "//span[@class='MW4etd']") else "N/A"),
#             "Reviews": clean_text(driver.find_element(By.XPATH, "//span[@class='UY7F9']").text if driver.find_elements(By.XPATH, "//span[@class='UY7F9']") else "N/A"),
#             "Plus Code": clean_text(driver.find_element(By.XPATH, "//button[@data-tooltip='Copy plus code']").text if driver.find_elements(By.XPATH, "//button[@data-tooltip='Copy plus code']") else "N/A"),
#             "Website": clean_text(driver.find_element(By.XPATH, "//a[contains(@aria-label, 'Visit') or contains(@href, 'http')]").get_attribute("href") if driver.find_elements(By.XPATH, "//a[contains(@aria-label, 'Visit') or contains(@href, 'http')]") else "N/A"),
#             "Latitude": latitude,
#             "Longitude": longitude
#         }

#         return {
#             "success": True, 
#             "message": "Data retrieved successfully", 
#             "data": details
#         }

#     except Exception as e:
#         return {
#             "success": False, 
#             "message": str(e)
#         }

#     finally:
#         driver.quit()


def get_google_maps_details(url):
    # Create unique user data directory
    temp_dir = tempfile.mkdtemp()
    user_data_dir = os.path.join(temp_dir, f"chrome_user_data_{uuid.uuid4().hex}")
    
    options = webdriver.ChromeOptions()
    
    # Essential arguments for Docker
    options.add_argument("--headless")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--disable-gpu")
    options.add_argument("--remote-debugging-port=9222")
    options.add_argument("--window-size=1920,1080")
    options.add_argument("--disable-extensions")
    options.add_argument("--no-first-run")
    options.add_argument("--disable-default-apps")
    options.add_argument("--disable-translate")
    options.add_argument("--disable-plugins")
    options.add_argument("--disable-background-timer-throttling")
    options.add_argument("--disable-renderer-backgrounding")
    options.add_argument("--disable-backgrounding-occluded-windows")
    options.add_argument("--disable-ipc-flooding-protection")
    options.add_argument("--single-process")  # Important for Docker
    options.add_argument("--disable-logging")
    options.add_argument("--disable-crash-reporter")
    options.add_argument("--disable-in-process-stack-traces")
    options.add_argument(f"--user-data-dir={user_data_dir}")
    
    # Use environment variable for Chrome binary (set by Dockerfile)
    chrome_binary = os.environ.get('GOOGLE_CHROME_BIN', '/usr/local/bin/chrome')
    options.binary_location = chrome_binary
    
    driver = None
    try:
        # Use environment variable for ChromeDriver (set by Dockerfile)
        chromedriver_path = os.environ.get('CHROMEDRIVER_PATH', '/usr/local/bin/chromedriver')
        service = Service(chromedriver_path)
        
        driver = webdriver.Chrome(service=service, options=options)
        
        time.sleep(random.randint(2, 5))
        driver.get(url)

        WebDriverWait(driver, 15).until(
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
            except Exception as e:
                print(f"Error closing driver: {e}")
        
        # Clean up temporary directory
        try:
            shutil.rmtree(temp_dir, ignore_errors=True)
        except Exception as e:
            print(f"Error cleaning up temp directory: {e}")


# Alternative version using WebDriverManager (fallback)
def get_google_maps_details_webdriver_manager(url):
    temp_dir = tempfile.mkdtemp()
    user_data_dir = os.path.join(temp_dir, f"chrome_user_data_{uuid.uuid4().hex}")
    
    options = webdriver.ChromeOptions()
    options.add_argument("--headless")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--disable-gpu")
    options.add_argument("--remote-debugging-port=9222")
    options.add_argument("--window-size=1920,1080")
    options.add_argument("--disable-extensions")
    options.add_argument("--single-process")
    options.add_argument(f"--user-data-dir={user_data_dir}")
    
    # Let WebDriverManager handle the Chrome binary and driver
    chrome_binary = os.environ.get('GOOGLE_CHROME_BIN')
    if chrome_binary:
        options.binary_location = chrome_binary
    
    driver = None
    try:
        # Use WebDriverManager as fallback
        service = Service(ChromeDriverManager().install())
        driver = webdriver.Chrome(service=service, options=options)
        
        time.sleep(random.randint(2, 5))
        driver.get(url)

        WebDriverWait(driver, 15).until(
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
            except Exception:
                pass
        
        try:
            shutil.rmtree(temp_dir, ignore_errors=True)
        except Exception:
            pass


def gemini_ai(api_key,prompt):
    client = genai.Client(api_key=api_key)
    response = client.models.generate_content(
        model="gemini-2.0-flash", contents=prompt
    )
    return response.text

def new_gemini(api_key, prompt):
    genai.configure(api_key=api_key)
    try:
        model = genai.GenerativeModel("gemini-1.5-pro-latest")
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        return f"Error generating SWOT analysis: {e}"

def parse_swot_text(text):
    """Parse raw text from Gemini API into structured format"""
    sections = {
        "strengths": [],
        "weaknesses": [],
        "opportunities": [],
        "threats": []
    }
    
    current_section = None
    current_title = None
    
    lines = text.split('\n')
    for line in lines:
        line = line.strip()
        
        if not line:
            continue
            
        # Identify sections
        if "**Strengths**" in line:
            current_section = "strengths"
            continue
        elif "**Weaknesses**" in line:
            current_section = "weaknesses"
            continue
        elif "**Opportunities**" in line:
            current_section = "opportunities"
            continue
        elif "**Threats**" in line:
            current_section = "threats"
            continue
            
        if line.startswith('*') and current_section:
            line = line.lstrip('* ')
            
            if ':**' in line:
                title, description = line.split(':**', 1)
                sections[current_section].append({
                    "title": title.strip(),
                    "description": description.strip()
                })
            elif ':' in line:
                title, description = line.split(':', 1)
                sections[current_section].append({
                    "title": title.strip(),
                    "description": description.strip()
                })
            else:
                sections[current_section].append({
                    "title": "",
                    "description": line.strip()
                })
    
    return sections

def format_swot_response(raw_text):
    """Main function to process and format SWOT analysis"""
    try:
        parsed_data = parse_swot_text(raw_text)
        
        formatted_response = {
            "success": True,
            "message": "Data retrieved successfully",
            "response": {
                "swot_analysis": parsed_data
            }
        }
        
        return formatted_response
        
    except Exception as e:
        raise Exception(f"Error formatting SWOT analysis: {str(e)}")

def grok_api_call(prompt, api_key):

    print("api key",api_key)
    url = "https://api.x.ai/v1/chat/completions"
    
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {api_key}"
    }
    
    data = {
        "messages": [
            {
                "role": "system",
                "content": "You are a test assistant."
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        "model": "grok-3-latest",
        "stream": False,
        "temperature": 0
    }
    
    response = requests.post(url, headers=headers, json=data)
    return response.json()
