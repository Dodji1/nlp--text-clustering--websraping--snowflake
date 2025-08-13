import joblib
import numpy as np

class ClusterModel:
    def __init__(self, model_path: str="knn_model.joblib"):
        self.model_path = model_path
        self.model = self._load_model()

    def _load_model(self):
        return joblib.load(self.model_path)

    def predict(self, vectors):
        # Ensure numpy array
        X = np.array(vectors)
        return self.model.predict(X).tolist()
