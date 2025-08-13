from sentence_transformers import SentenceTransformer
import numpy as np

# ========= EMBEDDING =========
def embed(sentences: list[str]) -> np.ndarray:
    """
    Generate embeddings for a list of sentences.
    """
    if not isinstance(sentences, list):
        sentences = [sentences]

    if not sentences:
        return np.array([])

    model = SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')
    embeddings = model.encode(sentences)
    return embeddings


# ========= PIPELINE USAGE =========
# Example: use description column from previous step
# texts = df['description'].tolist()  # or df['tokens'].apply(lambda t: " ".join(t))
# df['vector'] = list(embed(texts))
