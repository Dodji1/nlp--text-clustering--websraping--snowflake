import pandas as pd
from scraper import get_all_product_urls, scrape_product
from preprocessor import cleanse, cleanse_and_tokenize
from embedder___ import embed
from Cluster import predict  # wrapped clustering function
from MongoDBWrapper import MongoDBWrapper


def main():
    # ========= 1. SCRAPE =========
    base_url = "https://books.toscrape.com/catalogue/"
    start_page = "page-1.html"
    print("🔍 Scraping product URLs...")
    urls = get_all_product_urls(base_url, start_page)

    print("📄 Scraping product details and saving progressively...")
    mongo_raw = MongoDBWrapper(db_name="eeia", collection_name="BooksRaw")

    data = []
    for url in urls:
        content = scrape_product(url)
        mongo_raw.create(content)
        print(f'    Scraping {url}')
        data.append(content)

    df = pd.DataFrame(data)

    # ========= 2. PREPROCESS =========
    print("🧹 Cleaning and tokenizing descriptions...")
    df = cleanse(df)
    texts = df["description"].fillna("").tolist()

    print(df.info())
    print(df.describe())
    df["tokens"] = df["description"].apply(cleanse_and_tokenize)

    # ========= 3. EMBED =========
    print("🧠 Generating embeddings...")
    texts = df["description"].fillna("").tolist()
    df["vector"] = list(embed(texts))

    # ========= 4. CLUSTER =========
    print("📊 Clustering embeddings...")
    df["cluster"] = predict(df["vector"].tolist())  # wrapped function usage
    print(df.head())
    df["vector"] = df['vector'].apply(lambda x: x.tolist())

    # ========= 5. SAVE EMBEDDED & CLUSTERED TO MONGODB =========
    print("💾 Saving embedded & clustered products to MongoDB...")
    mongo_embed = MongoDBWrapper(db_name="eeia", collection_name="BooksCleanEmbedded")
    mongo_embed.create_many(df.to_dict(orient="records"))

    print("✅ Pipeline completed successfully.")


if __name__ == "__main__":
    main()
