import os
from dotenv import load_dotenv
from langchain_community.document_loaders import DirectoryLoader, TextLoader
from langchain_community.vectorstores import Chroma
from langchain_core.embeddings import Embeddings
from google import genai

# Load GEMINI_API_KEY from backend/.env
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "..", ".env"))

class NewGenAIEmbeddings(Embeddings):
    """
    Uses Google's modern 'google-genai' SDK with an automatic
    fallback to embedding-001 if text-embedding-004 returns a 404.
    """
    def __init__(self):
        self.client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

    def embed_documents(self, texts):
        embeddings = []
        for text in texts:
            try:
                # Try preferred modern model
                response = self.client.models.embed_content(
                    model="text-embedding-004",
                    contents=text
                )
                embeddings.append(response.embeddings[0].values)
            except Exception:
                # Safe fallback to universally available model
                response = self.client.models.embed_content(
                    model="embedding-001",
                    contents=text
                )
                embeddings.append(response.embeddings[0].values)
        return embeddings

    def embed_query(self, text):
        try:
            response = self.client.models.embed_content(
                model="text-embedding-004",
                contents=text
            )
            return response.embeddings[0].values
        except Exception:
            response = self.client.models.embed_content(
                model="embedding-001",
                contents=text
            )
            return response.embeddings[0].values

def build_db():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    knowledge_dir = os.path.join(base_dir, "knowledge")
    persist_dir = os.path.join(base_dir, "chroma_db")
    
    print(f"Scanning target directory: {knowledge_dir}...")
    
    if not os.path.exists(knowledge_dir):
        print(f"Error: Target directory '{knowledge_dir}' path not found!")
        return

    loader = DirectoryLoader(
        knowledge_dir,
        glob="*.txt",
        loader_cls=lambda path: TextLoader(path, encoding="utf-8")
    )

    print("Loading text files content streams...")
    docs = loader.load()
    print(f"Loaded {len(docs)} documents successfully.")

    print("Initializing Robust Google GenAI Embeddings Engine...")
    embeddings = NewGenAIEmbeddings()

    print("Compiling embeddings vector nodes and creating local ChromaDB store...")
    db = Chroma.from_documents(
        docs,
        embeddings,
        persist_directory=persist_dir
    )

    print("Success: Vector DB Created and Saved in './chroma_db' folder.")

if __name__ == "__main__":
    build_db()