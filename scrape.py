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

def get_data(link):
  try:
    response = requests.get(link, headers={'User-Agent': 'test'})

    if response.status_code == 200:
      data = BeautifulSoup(response.content, 'lxml')
      return data
  except:
    print('Something went wrong')

def get_nutrition_facts(smartLabel):
  nutrition_facts = {'primary': {}, 'secondary': {}}
  servings_per_container = smartLabel.find('p', {'class': 'nutrition-facts__servings'}).text
  serving_size = smartLabel.find('p', {'class': 'nutrition-facts__serving-size'}).text
  serving_size = ' '.join(serving_size.split())

  table = smartLabel.select('tbody > tr')
  
  for i in range(2, len(table)):
    if table[i].find('th'):
      header = table[i].find('th').text
      header = ' '.join(header.split())
      if table[i].has_key('class'):
        # should add for amount and dv
        nutrition_facts['secondary'][header] = table[i].find('td').text
      else:
        #should add for amount and dv
        nutrition_facts['primary'][header] = table[i].find('td').text
        pass
      print(nutrition_facts)
      print('----------')

  # print(servings_per_container)
  # print(serving_size)
  # print(table)

for a in cereal_links:
  link = a['href']
  data = get_data(link)

  name = data.find('h1').text
  details = data.find('p', {'itemprop': 'Product Description'}).text
  img = f"https:{data.find('img', {'itemprop': 'Product Image'})['src']}"

  smartLabel_link = data.find('span', {'class': 'smtLabelbtn'}).a['href']
  smartLabel_data = get_data(smartLabel_link)
  
  ingredients = get_ingredients(smartLabel_data)
  nutrition_facts = get_nutrition_facts(smartLabel_data)

  # cereal = {}
  # cereal['details'] = details
  # cereal['img'] = img
  # cereal['ingredients'] = ingredients

  # cereals.append(cereal)

# print(cereals)

source.close()