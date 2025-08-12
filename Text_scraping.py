import requests
from bs4 import BeautifulSoup

url = "https://books.toscrape.com/"
response = requests.get(url)
soup = BeautifulSoup(response.text, "html.parser")

# Les titres des livres sont dans les balises <h3> à l'intérieur d'un <article class="product_pod">
for article in soup.find_all("article", class_="product_pod"):
    titre = article.h3.a["title"]
    print(titre)
