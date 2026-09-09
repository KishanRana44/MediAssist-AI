import os

from dotenv import load_dotenv

load_dotenv(
    os.path.join(
        os.path.dirname(__file__),
        "..",
        ".env"
    )
)

BASE_DIR = os.path.dirname(
    os.path.abspath(__file__)
)

MODEL_NAME = os.getenv(
    "MODEL_NAME",
    "gemini-2.5-flash"
)

GEMINI_API_KEY = os.getenv(
    "GEMINI_API_KEY"
)

CHROMA_PATH = os.path.join(
    BASE_DIR,
    "chroma_db"
)

KNOWLEDGE_PATH = os.path.join(
    BASE_DIR,
    "..",
    "knowledge_base"
)