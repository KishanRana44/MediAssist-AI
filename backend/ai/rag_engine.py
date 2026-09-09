import os
import warnings
from dotenv import load_dotenv

# Suppress annoying deprecation warnings from cluttering terminal logs
warnings.filterwarnings("ignore", category=DeprecationWarning)
warnings.filterwarnings("ignore", category=UserWarning)

# Load environmental variables from your centralized .env configuration
load_dotenv()

try:
    # Utilizing the modern standalone chroma package to prevent community sunset warnings
    from langchain_chroma import Chroma
    from langchain_core.embeddings import Embeddings
    from google import genai
    LANGCHAIN_AVAILABLE = True
except ImportError:
    LANGCHAIN_AVAILABLE = False

class StableGoogleEmbeddings(Embeddings):
    """
    Modern Google GenAI SDK embedding client forced to use stable
    production configurations with robust error control mechanisms.
    """
    def __init__(self):
        self.client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

    def embed_documents(self, texts):
        embeddings = []
        for text in texts:
            try:
                response = self.client.models.embed_content(
                    model="text-embedding-004",
                    contents=text
                )
                embeddings.append(response.embeddings[0].values)
            except Exception:
                # Automated robust safety failover
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

# Singleton DB Instance Caching to prevent heavy disk reload on every single network request
_db_instance = None

def get_db_connection():
    global _db_instance
    if _db_instance is None:
        base_dir = os.path.dirname(os.path.abspath(__file__))
        # Update directory routing to target the same chroma database location cleanly
        persist_dir = os.path.abspath(os.path.join(base_dir, "..", "ai", "chroma_db"))
        
        if LANGCHAIN_AVAILABLE and os.path.exists(persist_dir) and os.getenv("GEMINI_API_KEY"):
            embeddings = StableGoogleEmbeddings()
            _db_instance = Chroma(persist_directory=persist_dir, embedding_function=embeddings)
    return _db_instance

def get_medical_context(prediction):
    """
    Queries the vector database using specific prediction keys to pull
    the top context instances for LLM ingestion.
    """
    db = get_db_connection()
    if not db:
        return "Warning: Vector Knowledge Base connection uninitialized or key missing."

    try:
        # Pulling context targets matching structural query specifications
        docs = db.similarity_search(prediction, k=3)
        return "\n\n".join([doc.page_content for doc in docs])
    except Exception as e:
        return f"Error executing similarity query search parameters: {str(e)}"