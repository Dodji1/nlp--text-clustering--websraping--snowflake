from bs4 import BeautifulSoup
import requests
from urllib.parse import urljoin
import re

# ========= 2. EXTRACT =========
def get_all_product_urls(base_url: str, start_page: str) -> list[str]:
    """
    Crawl all product URLs starting from the given page.
    """
    urls = []
    page_url = urljoin(base_url, start_page)

    while page_url:
        r = requests.get(page_url)
        r.encoding = "utf-8"
        soup = BeautifulSoup(r.text, "html.parser")

        for a in soup.select("h3 a"):
            product_url = urljoin(page_url, a["href"])
            urls.append(product_url)

        next_link = soup.select_one("li.next a")
        page_url = urljoin(page_url, next_link["href"]) if next_link else None

    print(f"✅ Total produits trouvés : {len(urls)}")
    return urls


# ========= 3. TRANSFORM =========
def scrape_product(page_url: str) -> dict:
    """
    Scrape product details from a given product page URL.
    """
    r = requests.get(page_url)
    r.encoding = "utf-8"
    soup = BeautifulSoup(r.text, "html.parser")

    title = soup.select_one(".product_main h1").get_text(strip=True)

    price_tag = soup.select_one(".price_color")
    price = float(price_tag.text.replace("£", "").replace("€", "").replace(",", ".")) if price_tag else None

    category_tag = soup.select_one("ul.breadcrumb li:nth-child(3) a")
    category = category_tag.get_text(strip=True) if category_tag else None

    quantity_tag = soup.select_one(".instock.availability")
    quantity = int(re.search(r"\d+", quantity_tag.text).group()) if quantity_tag and re.search(r"\d+", quantity_tag.text) else None

    description_tag = soup.select_one("#content_inner > article > p")
    description = description_tag.get_text(strip=True) if description_tag else None

    upc_tag = soup.select_one("table tr:nth-child(1) td")
    upc = upc_tag.get_text(strip=True) if upc_tag else None

    image_tag = soup.select_one("#product_gallery img")
    image_url = urljoin(page_url, image_tag.get("src")) if image_tag else None

    return {
        "url": page_url,
        "title": title,
        "category": category,
        "price": price,
        "quantity": quantity,
        "description": description,
        "upc": upc,
        "image_url": image_url
    }


# def scrape(base_url, page_url) -> None:
#     while page_url:
#         url = base_url + page_url
#         response = requests.get(url)
#         soup = BeautifulSoup(response.text, 'html.parser')
#         books = soup.find_all('article', class_='product_pod')

#         for book in books:
#             href = book.h3.a['href']
#             book_url = base_url + href.replace('../', '')
#             book_response = requests.get(book_url)
#             print(f"URL du livre: {book_url}")
#             print(f"Statut de la réponse: {book_response.status_code}")
#             book_soup = BeautifulSoup(book_response.text, 'html.parser')
#             # print(book_soup.prettify())

#             title = book_soup.h1.text
#             price = book_soup.find('p', class_='price_color').text
#             description = book_soup.find('meta', attrs={'name': 'description'})['content'].strip()
#             #availability = book_soup.find('p', class_='instock availability').text.strip()
#             #rating = book_soup.find('p', class_='star-rating')['class'][1]

#             inserted_id = wrapper.create({
#                     "unique_id": str(uuid.uuid4()),
#                     # "values": model.encode(description).tolist(),
#                     "metadata": {
#                         "title": title,
#                         "price": price,
#                     }
#                 })

#             print(f'Livre inséré : {title}')

#         next_btn = soup.find('li', class_='next')
#         if next_btn:
#             page_url = next_btn.a['href']
#         else:
#             break

#     # --- Fermeture de la connexion ---
#     print("Scraping terminé. Toutes les données ont été sauvegardées dans books.db.")

