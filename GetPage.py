from selenium import webdriver
from selenium.webdriver.firefox.service import Service
from selenium.webdriver.common.by import By
from urllib import robotparser

service = Service("./geckodriver")
driver = webdriver.Firefox(service=service)



url = "https://alliantnational.com/about/our-team/david-sinclair/"
driver.get(url)

dotCom = url.split(".com")
dotComSplit = dotCom[0] + ".com/robots.txt"

rp = robotparser.RobotFileParser()
rp.set_url(dotComSplit)
rp.read()
    
if not rp.can_fetch("*", dotComSplit):
    print("robot says no")
else:
    paragraphs = driver.find_elements(By.TAG_NAME, "p")
    for paragraph in paragraphs:
        print(paragraph.text)


driver.quit()

