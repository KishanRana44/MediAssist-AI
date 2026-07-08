import os

import chromadb

from sentence_transformers import SentenceTransformer

# ==========================================
# Paths
# ==========================================

BASE_DIR = os.path.dirname(
    os.path.abspath(__file__)
)

VECTOR_DB = os.path.join(
    BASE_DIR,
    "..",
    "..",
    "vector_db"
)

# ==========================================
# Embedding Model
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
# Retrieve
# ==========================================

def retrieve_context(
    query,
    top_k=5
):

    embedding = embedding_model.encode(
        query
    ).tolist()

    results = collection.query(

        query_embeddings=[embedding],

        n_results=top_k

    )

    contexts = []

    if results["documents"]:

        for doc in results["documents"][0]:

            contexts.append(doc)

    return contexts


# ==========================================
# Test
# ==========================================

if __name__ == "__main__":

    data = retrieve_context(
        "Normal Sinus Rhythm"
    )

    print()

    print("=" * 60)

    print("Retrieved Context")

    print("=" * 60)

    for item in data:

        print()

        print(item)

        print("-" * 40)