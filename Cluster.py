from sklearn.cluster import KMeans
import numpy as np
import pandas as pd

def predict(sentence_embeddings: list[list[float]], n_clusters: int = 14, random_state: int = 42) -> np.ndarray:
    """
    Cluster sentence embeddings into groups using KMeans.

    Args:
        sentence_embeddings (list[list[float]]): List of embedding vectors.
        n_clusters (int): Number of clusters.
        random_state (int): Random seed for reproducibility.

    Returns:
        np.ndarray: Cluster labels for each embedding.
    """
    if not sentence_embeddings:
        return np.array([])

    model = KMeans(n_clusters=n_clusters, random_state=random_state, init="k-means++")
    model.fit(sentence_embeddings)
    return model.labels_


# # ========= PIPELINE USAGE =========
# # Example with DataFrame from the previous ETL step
# # Ensure all vectors are numpy arrays
# vectors = np.array(df["vector"].tolist())
# df["cluster"] = predict(vectors, n_clusters=14)
