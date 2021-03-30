from bs4 import BeautifulSoup
import requests

source = open("./Breakfast Cereal _ Kellogg's Foods.html")
soup = BeautifulSoup(source, 'lxml')
section = soup.find('section', {'id': 'Foods-content'})
cereal_links = section.select('div.brandIcon > a')
cereals = []

def get_ingredients(smartLabel):
  ingredients = []
  ingredients_list = smartLabel.find('ul', {'id': 'ingredients-list'})
  ingredients_list_children = ingredients_list.select('li > a > div')

  for div in ingredients_list_children:
    ingredient = div.text.strip()
    ingredients.append(ingredient)

  return ', '.join(ingredients)

for a in cereal_links:
  link = a['href']
  response = requests.get(link, headers={'User-Agent': 'test'})

  if response.status_code == 200:
    data = BeautifulSoup(response.content, 'lxml')
    details = data.find('p', {'itemprop': 'Product Description'}).text
    img = f"https:{data.find('img', {'itemprop': 'Product Image'})['src']}"

    smartLabel_link = data.find('span', {'class': 'smtLabelbtn'}).a['href']
    smartLabel = requests.get(smartLabel_link, headers={'User-Agent': 'test'})
    smartLabel_data = BeautifulSoup(smartLabel.content, 'lxml')
    
    ingredients = get_ingredients(smartLabel_data)

    cereal = {}
    cereal['details'] = details
    cereal['img'] = img

    cereals.append(cereal)

print(cereals)

source.close()