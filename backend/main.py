from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from modules.heart.heart_router import router as heart_router

app = FastAPI(
    title="MediAssist AI - Core API",
    description="Backend API hosting 5 clinical modules: ecg, heart, xray, aichatbot, report"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register active heart sound module
app.include_router(heart_router)

# Health endpoint showing module statuses
@app.get("/api/health")
def health():
    return {
        "status": "online",
        "modules": {
            "ecg": "pending",
            "heart": "active",
            "xray": "pending",
            "aichatbot": "pending",
            "report": "pending"
        }
    }
@app.get("/")
def root():
    return {
        "project": "MediAssist AI",
        "status": "online",
        "docs_url": "http://localhost:8000/docs"
    }

    
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)