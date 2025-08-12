import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin
import csv
import os

# Chemin du dossier où enregistrer le CSV
output_dir = "/home/megnigbeto/Documents/Formation EEIA 2025/SEMAINE PROJET (Classification automatique des livres électoniques)"
if not os.path.exists(output_dir):
    os.makedirs(output_dir)
csv_path = os.path.join(output_dir, "books.csv")

base_url = "https://books.toscrape.com/"
next_page_url = "catalogue/page-1.html"

books = []

while next_page_url:
    url = urljoin(base_url, next_page_url)
    response = requests.get(url)
    soup = BeautifulSoup(response.text, "html.parser")
    
    for article in soup.find_all("article", class_="product_pod"):
        titre = article.h3.a["title"]
        livre_relative_url = article.h3.a["href"]
        livre_url = urljoin(url, livre_relative_url)
        prix = article.find("p", class_="price_color").text.strip()
        img_relative_url = article.find("img")["src"]
        img_url = urljoin(url, img_relative_url)
        
        # Aller sur la page du livre pour récupérer la description
        livre_resp = requests.get(livre_url)
        livre_soup = BeautifulSoup(livre_resp.text, "html.parser")
        desc_tag = livre_soup.find("meta", attrs={"name": "description"})
        description = desc_tag["content"].strip() if desc_tag else "Pas de description"
        
        books.append({
            "titre": titre,
            "prix": prix,
            "description": description,
            "image_url": img_url
        })
    
    # Pagination
    next_btn = soup.find("li", class_="next")
    if next_btn and next_btn.a:
        next_page_url = urljoin("catalogue/", next_btn.a["href"])
    else:
        next_page_url = None

# Écriture dans le CSV
with open(csv_path, "w", newline='', encoding='utf-8') as csvfile:
    fieldnames = ["titre", "prix", "description", "image_url"]
    writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
    writer.writeheader()
    for book in books:
        writer.writerow(book)

print(f"Fichier CSV sauvegardé sous : {csv_path}")
