from pymongo import MongoClient, ASCENDING
from pymongo.errors import DuplicateKeyError

class MongoDBWrapper:
    def __init__(self, uri: str = "mongodb://localhost:27017/", db_name: str = "eeia", collection_name: str = "BooksRaw"):
        self.client = MongoClient(uri)
        self.db = self.client[db_name]
        self.collection = self.db[collection_name]
        
        # Optional: uncomment if you actually have unique_id in the documents
        # self.collection.create_index([("unique_id", ASCENDING)], unique=True)

    def create(self, document: dict):
        """
        Insert a single document, ensuring `metadata` and `vector` fields exist.
        """
        document.setdefault("metadata", {})
        document.setdefault("vector", [])

        try:
            result = self.collection.insert_one(document)
            return result.inserted_id
        except DuplicateKeyError:
            raise ValueError("Document with the same unique_id already exists.")

    def create_many(self, documents: list[dict]):
        """
        Insert multiple documents at once.
        """
        for doc in documents:
            doc.setdefault("metadata", {})
            doc.setdefault("vector", [])
        return self.collection.insert_many(documents).inserted_ids

    def read(self, filter_dict: dict):
        """
        Read a single document matching the filter.
        """
        return self.collection.find_one(filter_dict)

    def update(self, filter_dict: dict, update_fields: dict):
        """
        Update fields in a document matching the filter.
        """
        update = {"$set": update_fields}
        return self.collection.update_one(filter_dict, update).modified_count

    def delete(self, filter_dict: dict):
        """
        Delete a document matching the filter.
        """
        return self.collection.delete_one(filter_dict).deleted_count

    def find_all(self, filter_dict: dict = None, limit: int = 0):
        """
        Find all documents matching the filter.
        """
        filter_dict = filter_dict or {}
        return list(self.collection.find(filter_dict).limit(limit))
