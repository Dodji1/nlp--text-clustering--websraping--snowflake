from fastapi import FastAPI
from pydantic import BaseModel
from typing import Union, List
from fastapi.middleware.cors import CORSMiddleware

print("DEBUUUUUUUUUUUUUG")

from embedder___ import embed  # Reuse your existing embedding function
from get_cluster_and_score import _predict


MAPPING_TO_CLASS = {
    0: "Young Adult & Coming-of-Age Fiction",
    1: "Non-Fiction & Social Sciences",
    2: "Epic Fantasy & Dystopian Fiction",
    3: "Literary Classics & Historical Novels",
    4: "Science Fiction & Modern Fantasy"
}


app = FastAPI(title="KMeans Clustering API", version="1.1.0")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # You can restrict this to a list of allowed origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class PredictRequest(BaseModel):
    text: Union[str, List[str]]


class PredictedClass(BaseModel):
    cluste: str
    score: float


@app.post("/predict")
def predict(req: PredictRequest):
    # Ensure list format

    print(req)
    print(req.text)
    print(type(req))
    sentences = [req.text] if not isinstance(req.text, list) else req.text
    

    # Embed
    vectors = embed(sentences)
    # print(type(vectors))
    vectors = vectors.tolist()
    # print(type(vectors))
    # print(len(vectors))
    # print(vectors[0])

    # Predict clusters
    cluster, score = _predict(vectors)
    print(type(score), score, type(score[0]), score[0])

    # Return in same structure as input
    if isinstance(req.text, str):
        return {
            "cluster": cluster,
            # "score": int(score[0])
        }
    else:
        return {"clusters": [int(c) for c in predictions]}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
