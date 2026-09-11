from fastapi import APIRouter, UploadFile, File, HTTPException
from modules.heart.heart_preprocessor import (
    preprocess_heart_audio,
    generate_spectrogram_image,
)
from modules.heart.heart_model_service import heart_service

router = APIRouter(prefix="/api/heart", tags=["Heart Sound Analysis"])


@router.post("/analyze")
async def analyze_heart_audio(file: UploadFile = File(...)):
    print(f"--- [1] Request Received for: {file.filename}")

    # File extension check (case-insensitive)
    if not file.filename.lower().endswith(('.wav', '.mp3', '.ogg', '.m4a', '.webm')):
        print("--- [ERROR] Invalid file extension detected")
        raise HTTPException(
            status_code=400,
            detail="Invalid format. Please upload .wav, .mp3, .ogg, or .m4a audio."
        )

    try:
        content = await file.read()
        if not content:
            print("--- [ERROR] Uploaded file content is empty")
            raise HTTPException(status_code=400, detail="Empty audio file provided.")
            
        print(f"--- [2] File Read complete, size: {len(content)} bytes")

        # Step 3: Preprocessing
        print("--- [3] Preprocessing Audio...")
        input_tensor = preprocess_heart_audio(content)
        print(f"--- [4] Preprocessing Done! Shape: {input_tensor.shape}")

        # Step 5: Spectrogram generation
        print("--- [5] Generating Spectrogram Image...")
        spectrogram_b64 = generate_spectrogram_image(input_tensor[0, :, :, 0])
        print("--- [6] Spectrogram Generated!")

        # Step 7: Inference
        print("--- [7] Running Model Prediction...")
        result = heart_service.predict_sound(input_tensor)
        print(f"--- [8] Prediction Done: {result}")

        return {
            "module": "heart",
            "filename": file.filename,
            "analysis": result,
            "spectrogram_image": spectrogram_b64,
            "clinical_notes": (
                "Phonocardiogram indicates audible murmurs or acoustic irregularity. Cardiology referral advised."
                if result.get("is_abnormal")
                else "Normal S1 and S2 acoustic frequencies identified without significant murmurs."
            ),
        }
    except HTTPException:
        # Re-raise explicit HTTP exceptions without catching them as unexpected 500 errors
        raise
    except Exception as e:
        print(f"--- [ERROR OCCURRED] {type(e).__name__}: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail=f"Heart sound analysis error: {str(e)}"
        )