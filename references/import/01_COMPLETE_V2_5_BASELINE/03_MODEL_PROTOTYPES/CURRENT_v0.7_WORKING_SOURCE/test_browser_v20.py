"""Optional real-browser smoke tests for the additive four-aircraft offline v2.0 UI."""
from pathlib import Path
from playwright.sync_api import sync_playwright
import os

root=Path(__file__).resolve().parent
html=(root/'Universal_Four_Aircraft_Model_v2.0.html').read_text()
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True,executable_path=os.getenv('CHROMIUM','/usr/bin/chromium'),args=['--no-sandbox'])
    for width,height in [(1360,900),(390,844)]:
        page=browser.new_page(viewport={'width':width,'height':height})
        errors=[]
        page.on('pageerror',lambda exc:errors.append(str(exc)))
        page.set_content(html,wait_until='load')
        assert page.locator('#cards .aircard').count()==4
        assert page.locator('#storesThreeTable tbody tr').count()==4
        assert page.locator('#evidence .aircard').count()==4
        assert page.locator('#v20').count()==1
        assert page.locator('#v19').count()==1
        assert page.locator('#chartG svg').count()==1
        assert page.locator('#chartPs svg').count()==1
        page.locator('#validationAir').select_option('spitfire_lfix_bs543')
        assert page.locator('#validationTable tbody tr').count()==21
        assert '384.0 mph' in page.locator('#validationTable').inner_text()
        page.locator('#validationAir').select_option('p51b')
        assert page.locator('#validationTable tbody tr').count()>=9
        page.locator('#alt').fill('30000')
        assert page.locator('#cards .aircard').count()==4
        page.locator('#alt').fill('5000')
        page.locator('#speed').fill('170')
        assert 'Spitfire' in page.locator('#cards .aircard').last.inner_text()
        assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
        assert not errors,errors
        print(f'PASS v2.0 four-aircraft interactive Chromium {width}x{height} and no UI overflow')
        page.close()
    browser.close()
