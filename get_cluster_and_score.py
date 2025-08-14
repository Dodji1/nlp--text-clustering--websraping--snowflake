import numpy as np
import joblib

FILENAME = "knn_model.joblib"
pipeline_model = joblib.load(FILENAME)

def _predict(X, model=pipeline_model):
       # Predict labels
    labels = pipeline_model.predict(X)
    
    # Predict class probabilities
    probas = pipeline_model.predict_proba(X)
    
    # Take the maximum probability as the "score" for each prediction
    scores = np.max(probas, axis=1)
    
    return labels, scores
