from fastapi import FastAPI
from pydantic import BaseModel
from typing import Union, List
import joblib

from embedder___ import embed  # Reuse your existing embedding function

FILENAME = "knn_model.joblib"
loaded_model = joblib.load(FILENAME)

app = FastAPI(title="KNNModel model prediction")


class PredictRequest(BaseModel):
    text: Union[str, List[str]]


@app.post("/predict")
def predict(req: PredictRequest):
    # Ensure list format
    if isinstance(req.text, str):
        sentences = [req.text]
    else:
        sentences = req.text

    # Embed
    vectors = embed(sentences)
    # print(type(vectors))
    vectors = vectors.tolist()
    # print(type(vectors))
    # print(len(vectors))
    # print(vectors[0])

    # Predict clusters
    predictions = loaded_model.predict(vectors)

    # Return in same structure as input
    if isinstance(req.text, str):
        return {"cluster": int(predictions[0])}
    else:
        return {"clusters": [int(c) for c in predictions]}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
