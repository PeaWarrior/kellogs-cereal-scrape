from bs4 import BeautifulSoup
import requests
from requests_html import HTML, HTMLSession

source = open('../Downloads/kellogs.html')
soup = BeautifulSoup(source, 'lxml')
links = soup.findAll('a', {'class': 'card-url'})

for link in links:
  if link['href'].split('/')[4] == 'products':
    response = requests.get(link['href'], headers={'User-Agent':'test'})
    if response.status_code == 200:
      cereal = BeautifulSoup(response.content, 'lxml')
      smartLabel = cereal.find('span', {'class': 'smtLabelbtn'}).a
      if smartLabel:
        print(smartLabel['href'])

source.close()