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
  servings_per_container = smartLabel.find('p', {'class': 'nutrition-facts__servings'}).text
  servings_per_container = ' '.join(servings_per_container.split()[3:])
  serving_size = smartLabel.find('p', {'class': 'nutrition-facts__serving-size'}).text
  serving_size = ' '.join(serving_size.split()[2:])

  table = smartLabel.select('tbody > tr')
  calories = table[0].find_all('th')[1].text
  primary = []
  secondary = []
  
  for i in range(2, len(table)):
    if table[i].find('th'):
      header = table[i].find('th')
      name = table[i].find('th').text
      name = ' '.join(name.split())

      values = table[i].find_all('td')
      amount = values[0].text
      dv = values[1].text

      nutrient = {
        name: {
          'amount': amount,
          'dv': dv,
        }
      }

      if header.has_attr('class'):
        nutrient_type = header['class'][0]
        prev_nutrient = primary[-1]

        if nutrient_type == 'nutrition-facts__secondary-item':
          secondary.append(nutrient)
        elif nutrient_type == 'nutrition-facts__item--subfield1':
          if 'subfields' not in prev_nutrient:
            prev_nutrient['subfields'] = []
          prev_nutrient['subfields'].append(nutrient)
        elif nutrient_type == 'nutrition-facts__item--subfield2':
          if 'subfields2' not in prev_nutrient['subfields'][-1]:
            prev_nutrient['subfields'][-1]['subfields2'] = []
          prev_nutrient['subfields'][-1]['subfields2'].append(nutrient)
      else:
        primary.append(nutrient)

  nutrition_facts = {
    'servings_per_container': servings_per_container,
    'serving_size': serving_size,
    'calories': calories,
    'primary': primary,
    'secondary': secondary,
  }

  return nutrition_facts

for a in cereal_links:
  link = a['href']
  data = get_data(link)

  name = data.find('h1').text.strip()
  details = data.find('p', {'itemprop': 'Product Description'}).text.strip()
  img = f"https:{data.find('img', {'itemprop': 'Product Image'})['src']}"

  smartLabel_link = data.find('span', {'class': 'smtLabelbtn'}).a['href']
  smartLabel_data = get_data(smartLabel_link)
  
  ingredients = get_ingredients(smartLabel_data)
  nutrition_facts = get_nutrition_facts(smartLabel_data)

  cereal = {
    'name': name,
    'details': details,
    'img': img,
    'ingredients': ingredients
  }
  cereals.append(cereal)


source.close()