import os
from sentence_transformers import SentenceTransformer
import chromadb

# ==========================================
# Paths
# ==========================================

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

VECTOR_DB = os.path.join(
    BASE_DIR,
    "..",
    "vector_db"
)

# ==========================================
# Load Embedding Model
# ==========================================

embedding_model = SentenceTransformer(
    "sentence-transformers/all-MiniLM-L6-v2"
)

# ==========================================
# Load ChromaDB
# ==========================================

client = chromadb.PersistentClient(
    path=VECTOR_DB
)

collection = client.get_collection(
    "medical_guidelines"
)

# ==========================================
# Search Function
# ==========================================

def retrieve_context(query, top_k=5):

    embedding = embedding_model.encode(
        query
    ).tolist()

    results = collection.query(

        query_embeddings=[embedding],

        n_results=top_k

    )

    contexts = []

    for doc in results["documents"][0]:

        contexts.append(doc)

    return contexts


# ==========================================
# Testing
# ==========================================

if __name__ == "__main__":

    prediction = "Normal Sinus Rhythm"

    contexts = retrieve_context(prediction)

    print("=" * 70)

    print("Retrieved Clinical Context")

    print("=" * 70)

    for i, ctx in enumerate(contexts):

        print(f"\nChunk {i+1}\n")

        print(ctx)

        print("-" * 70)