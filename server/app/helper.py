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
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
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

def get_google_maps_details(url):
    options = webdriver.ChromeOptions()
    options.add_argument("--headless")
    options.add_argument("--disable-gpu")
    options.add_argument("--no-sandbox")
    chrome_binary_path = os.environ.get('GOOGLE_CHROME_BIN') # Get from ENV
    if not chrome_binary_path:
        chrome_binary_path = "/usr/bin/google-chrome"
    options.binary_location = chrome_binary_path
    # options.setBinary(chrome_binary_path);
    # chrome_driver = 
    chromedriver_path = os.environ.get('CHROMEDRIVER_PATH') # Get from ENV
    if not chromedriver_path:
        # Fallback in case the ENV var isn't set correctly in your environment when running (less likely in Docker if Dockerfile is correct)
        chromedriver_path = "/usr/local/bin/chromedriver" 
    # service = Service(ChromeDriverManager().install())
    service = Service(chromedriver_path)
    
    driver = webdriver.Chrome(service=service, options=options)

    try:
        delay = random.randint(3, 7)
        print(f"Waiting {delay} seconds before opening URL: {url}")
        time.sleep(delay)

        driver.get(url)
        time.sleep(5)

        latitude, longitude = extract_lat_lng(driver)

        details = {
            "URL": url,
            "Name": clean_text(driver.find_element(By.XPATH, "//h1[contains(@class, 'DUwDvf')]").text if driver.find_elements(By.XPATH, "//h1[contains(@class, 'DUwDvf')]") else "N/A"),
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
            "message": str(e)
        }

    finally:
        driver.quit()

def gemini_ai(api_key,prompt):
    client = genai.Client(api_key=api_key)
    response = client.models.generate_content(
        model="gemini-2.0-flash", contents=prompt
    )
    return response.text

def new_gemini(api_key, prompt):
    genai.configure(api_key=api_key)
    try:
        model = genai.GenerativeModel("gemini-pro")
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
