import requests
from bs4 import BeautifulSoup

# Spécifiez l'URL de la page à scraper
url = "https://books.toscrape.com/"

# Récupérer le contenu HTML de la page
response = requests.get(url)
if response.status_code == 200:
    html = response.text

    # Analyser le HTML avec BeautifulSoup
    soup = BeautifulSoup(html, 'html.parser')

    # Exemple : extraire tous les titres h1
    titres = soup.find_all('h1')
    for titre in titres:
        print(titre.text)
else:
    print("Erreur lors de la récupération de la page :", response.status_code)
