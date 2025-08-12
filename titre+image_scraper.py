import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin

url = "https://books.toscrape.com/"
response = requests.get(url)
soup = BeautifulSoup(response.text, "html.parser")

for article in soup.find_all("article", class_="product_pod"):
    # Récupérer le titre
    titre = article.h3.a["title"]
    # Récupérer l'URL de l'image (relative)
    img_relative_url = article.find("img")["src"]
    # Construire l'URL absolue de l'image
    img_url = urljoin(url, img_relative_url)
    print(f"Titre: {titre}")
    print(f"Image: {img_url}\n")
