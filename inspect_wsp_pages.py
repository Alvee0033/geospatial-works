import time
import os
import json
from selenium import webdriver
from selenium.webdriver.chrome.options import Options

os.makedirs("wsp_pages", exist_ok=True)

options = Options()
options.add_argument("--headless=new")
options.add_argument("--no-sandbox")
options.add_argument("--disable-dev-shm-usage")
options.add_argument("--window-size=1600,1080")
options.add_argument("user-agent=Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")

driver = webdriver.Chrome(options=options)

pages = [
    ("projects", "https://www.wsp.com/en-gl/projects"),
    ("news", "https://www.wsp.com/en-gl/news"),
    ("leadership", "https://www.wsp.com/en-gl/who-we-are/global-leadership"),
]

for name, url in pages:
    try:
        print(f"Navigating to {url} ...")
        driver.get(url)
        time.sleep(3)
        driver.execute_script("document.querySelector('.didomi-dismiss-button')?.click(); document.querySelector('#didomi-host')?.remove();")
        time.sleep(1)
        driver.save_screenshot(f"wsp_pages/{name}_top.png")
        driver.execute_script("window.scrollTo(0, 800);")
        time.sleep(1)
        driver.save_screenshot(f"wsp_pages/{name}_mid.png")
        print(f"Captured {name}")
    except Exception as e:
        print(f"Error on {name}:", e)

driver.quit()
