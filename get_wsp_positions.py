from selenium import webdriver
from selenium.webdriver.chrome.options import Options
import json

options = Options()
options.add_argument('--headless=new')
options.add_argument('--no-sandbox')
options.add_argument('--disable-dev-shm-usage')
options.add_argument('user-agent=Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')
options.add_argument('--window-size=1600,1000')

driver = webdriver.Chrome(options=options)
try:
    driver.get('https://www.wsp.com/en-gl/')
    import time
    time.sleep(2)
    
    script = """
    const items = [];
    document.querySelectorAll('header a, header button').forEach(el => {
        const r = el.getBoundingClientRect();
        if (r.height > 10 && r.width > 10 && r.top < 85) {
            items.push({
                text: el.innerText.trim().replace(/\\s+/g, ' ').slice(0, 30),
                tag: el.tagName,
                className: el.className,
                x: Math.round(r.left),
                y: Math.round(r.top),
                w: Math.round(r.width),
                h: Math.round(r.height)
            });
        }
    });
    items.sort((a, b) => a.x - b.x);
    return items;
    """
    res = driver.execute_script(script)
    for i in res:
        print(f"{i['x']:4d}px (w={i['w']:3d}): {i['text']:<25} [{i['className']}]")
finally:
    driver.quit()

