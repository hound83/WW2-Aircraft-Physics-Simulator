"""Optional Chromium smoke suite; uses set_content to support restricted test environments."""
from pathlib import Path
from playwright.sync_api import sync_playwright
import os
root=Path(__file__).resolve().parent
html=(root/'Universal_Three_Aircraft_Model_v1.5.html').read_text()
with sync_playwright() as p:
  browser=p.chromium.launch(headless=True,executable_path=os.getenv('CHROMIUM','/usr/bin/chromium'),args=['--no-sandbox'])
  for w,h in [(1360,900),(390,844)]:
    page=browser.new_page(viewport={'width':w,'height':h})
    errors=[];page.on('pageerror',lambda exc:errors.append(str(exc)))
    page.set_content(html,wait_until='load')
    assert page.locator('#cards .aircard').count()==3
    assert page.locator('#storesThreeTable tbody tr').count()==3
    assert page.locator('#mosquitoStoresTable tbody tr').count()==2
    assert page.locator('#p38SourceTable tbody tr').count()==5
    assert page.locator('#fwTable tbody tr').count()==5
    assert '28 mph' in page.locator('#fwStats').inner_text()
    page.locator('#fwInduced').evaluate('(el)=>{el.value="12";el.dispatchEvent(new Event("input",{bubbles:true}));}')
    assert '12%' in page.locator('#fwInducedO').inner_text()
    assert '22.0 mph' in page.locator('#storesReportStats').inner_text()
    page.locator('#mosquitoMode').select_option('raf-corrected')
    assert '18.3 mph' in page.locator('#storesReportStats').inner_text()
    page.locator('#mosquitoMode').select_option('raw')
    page.locator('#storeWeight').evaluate('(el)=>{el.value="1000";el.dispatchEvent(new Event("input",{bubbles:true}));}')
    assert '1,000 lb' in page.locator('#storeWeightO').inner_text()
    assert page.locator('#climbTable tbody tr').count()==5
    assert page.locator('#mustangTable tbody tr').count()==3
    assert '560 ft/min' in page.locator('#mustangStats').inner_text()
    assert page.locator('#auditTable tbody tr').count()==3
    assert page.locator('#auditDetails tbody tr').count()==11
    assert page.locator('#v15 tbody').count()==2
    assert page.locator('#v15 tbody tr').count()==9
    assert '1,484/1,602 rpm' in page.locator('#v15').inner_text()
    assert '577 ft/min' in page.locator('#mustangStats').inner_text()
    assert page.locator('#powerTable tbody tr').count()==7
    assert '56 ft/min' in page.locator('#climbStats').inner_text()
    assert page.locator('#chartG svg').count()==1
    assert page.locator('#greg27k tbody tr').count()==7
    assert page.locator('#gregTable tbody tr').count()==11
    page.locator('#gregWhich').select_option('p47d28')
    assert page.locator('#gregTable tbody tr').count()==12
    page.locator('#profile').select_option('B')
    assert page.locator('#mustangTable tbody tr').count()==3
    assert '630 ft/min' in page.locator('#mustangStats').inner_text()
    page.locator('#profile').select_option('C')
    page.locator('#alt').fill('27000')
    assert 'Unavailable' in page.locator('#cards .aircard').first.inner_text()
    page.locator('#alt').fill('5000')
    assert 'Unavailable' not in page.locator('#cards .aircard').first.inner_text()
    page.locator('#validationAir').select_option('p51b')
    assert page.locator('#validationTable tbody tr').count()>=9
    page.locator('#validationAir').select_option('bf109f4')
    assert page.locator('#validationTable tbody tr').count()==2
    assert '336 mph' in page.locator('#validationTable').inner_text()
    assert page.locator('#bfmode').input_value()=='combat'
    assert not errors,errors
    assert page.evaluate('document.documentElement.scrollWidth <= innerWidth'), 'mobile overflow'
    page.screenshot(path=str(root/('preview_desktop.png' if w>500 else 'preview_mobile.png')),full_page=False)
    print(f'PASS responsive Chromium {w}px, charts, source bounds and interactive comparisons')
    page.close()
  browser.close()
