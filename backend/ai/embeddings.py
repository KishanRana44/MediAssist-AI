import os
from tqdm import tqdm

import chromadb
from chromadb.config import Settings

from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import PyPDFLoader

from sentence_transformers import SentenceTransformer

# ==========================================
# Paths
# ==========================================

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

KNOWLEDGE_BASE = os.path.join(
    BASE_DIR,
    "..",
    "knowledge_base"
)

VECTOR_DB = os.path.join(
    BASE_DIR,
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
# ChromaDB
# ==========================================

client = chromadb.PersistentClient(
    path=VECTOR_DB
)

collection = client.get_or_create_collection(
    name="medical_guidelines"
)

# ==========================================
# Splitter
# ==========================================

splitter = RecursiveCharacterTextSplitter(

    chunk_size=800,

    chunk_overlap=150

)

# ==========================================
# Read PDFs
# ==========================================

pdfs = [

    f

    for f in os.listdir(KNOWLEDGE_BASE)

    if f.lower().endswith(".pdf")

]

print("=" * 60)

print("Medical PDFs Found:")

print(pdfs)

print("=" * 60)

total_chunks = 0

for pdf in tqdm(pdfs):

    path = os.path.join(

        KNOWLEDGE_BASE,

        pdf

    )

    loader = PyPDFLoader(path)

    docs = loader.load()

    docs = splitter.split_documents(docs)

    for i, doc in enumerate(docs):

        embedding = embedding_model.encode(

            doc.page_content

        ).tolist()

        collection.add(

            ids=[f"{pdf}_{i}"],

            embeddings=[embedding],

            documents=[doc.page_content],

            metadatas=[

                {

                    "source": pdf,

                    "chunk": i

                }

            ]

        )

        total_chunks += 1

print()

print("=" * 60)

print("Embedding Completed")

print("Total PDFs :", len(pdfs))

print("Total Chunks :", total_chunks)

print("=" * 60)