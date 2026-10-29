"""Real Chromium check of v2.2 source-derived controls, desktop and mobile."""
from pathlib import Path
from playwright.sync_api import sync_playwright
import os

root=Path(__file__).resolve().parent
page_html=(root/'Universal_Four_Aircraft_Model_v2.2.html').read_text()
with sync_playwright() as p:
 browser=p.chromium.launch(headless=True,
  executable_path=os.getenv('CHROMIUM','/usr/bin/chromium'),args=['--no-sandbox'])
 for width,height in [(1360,900),(390,844)]:
  page=browser.new_page(viewport={'width':width,'height':height})
  errors=[]
  page.on('pageerror',lambda exc:errors.append(str(exc)))
  page.set_content(page_html,wait_until='load')
  assert page.locator('#cards .aircard').count()==4
  assert page.locator('#v22').count()==1
  assert page.locator('#v21').count()==1
  assert page.locator('#chartG svg').count()==1
  assert page.locator('#chartPs svg').count()==1
  page.locator('#profile').select_option('G')
  assert page.locator('#cards .aircard').count()==4
  assert 'Greg' in page.locator('#v22').inner_text()
  page.locator('#calibration').select_option('refit')
  assert page.locator('#cards .aircard').count()==4
  page.locator('#f4scenario').select_option('greg')
  assert page.locator('#cards .aircard').count()==4
  assert 'Bf' in page.locator('#cards .aircard').first.inner_text()
  page.locator('#engineModel').select_option('ram')
  assert page.locator('#cards .aircard').count()==4
  assert not errors,errors
  assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
  print(f'PASS v2.2 real Chromium {width}×{height}: live power, drag and ram selectors')
  page.close()
 browser.close()
