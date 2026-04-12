import os
import io
import uuid
import zipfile
from typing import List, Optional
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
import numpy as np
import cv2
from PIL import Image
from rembg import remove
import base64

app = FastAPI(title="GridXD Processing Backend")

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Storage for processed images (temporary for this session)
OUTPUT_DIR = "static/outputs"
os.makedirs(OUTPUT_DIR, exist_ok=True)
app.mount("/static", StaticFiles(directory="static"), name="static")

def detect_icons(image_np):
    """
    Detect icons using OpenCV contours
    """
    gray = cv2.cvtColor(image_np, cv2.COLOR_BGR2GRAY)
    blurred = cv2.GaussianBlur(gray, (5, 5), 0)
    thresh = cv2.adaptiveThreshold(blurred, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, 
                                 cv2.THRESH_BINARY_INV, 11, 2)
    
    contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    regions = []
    min_size = min(image_np.shape[0], image_np.shape[1]) * 0.05
    
    for cnt in contours:
        x, y, w, h = cv2.boundingRect(cnt)
        if w > min_size and h > min_size:
            regions.append((x, y, w, h))
            
    # Sort regions top-to-bottom, left-to-right
    regions.sort(key=lambda r: (r[1] // 50, r[0]))
    return regions

@app.post("/process-image")
async def process_image(
    image: UploadFile = File(...),
    remove_background: str = Form("true"),
    upscale: str = Form("true"),
    project_name: Optional[str] = Form(None),
    system_prompt: Optional[str] = Form(None)
):
    try:
        # Read image
        contents = await image.read()
        nparr = np.frombuffer(contents, np.uint8)
        img_np = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if img_np is None:
            raise HTTPException(status_code=400, detail="Imagen inválida")

        # Detect icons
        regions = detect_icons(img_np)
        if not regions:
            # Fallback: treat whole image as one icon if nothing detected
            h, w = img_np.shape[:2]
            regions = [(0, 0, w, h)]

        session_id = str(uuid.uuid4())
        session_dir = os.path.join(OUTPUT_DIR, session_id)
        os.makedirs(session_dir, exist_ok=True)

        results = []
        zip_filename = f"{project_name or 'gridxd'}_assets.zip"
        zip_path = os.path.join(session_dir, zip_filename)

        with zipfile.ZipFile(zip_path, 'w') as zip_file:
            for i, (x, y, w, h) in enumerate(regions[:20]): # Limit to 20 icons
                padding = 20
                x1 = max(0, x - padding)
                y1 = max(0, y - padding)
                x2 = min(img_np.shape[1], x + w + padding)
                y2 = min(img_np.shape[0], y + h + padding)
                
                roi = img_np[y1:y2, x1:x2]
                
                # Convert to PIL for rembg
                roi_pil = Image.fromarray(cv2.cvtColor(roi, cv2.COLOR_BGR2RGB))
                
                # Remove BG
                if remove_background.lower() == "true":
                    roi_processed = remove(roi_pil)
                else:
                    roi_processed = roi_pil

                # Upscale if requested (simple resize for now, could use AI models later)
                if upscale.lower() == "true":
                    roi_processed = roi_processed.resize((2048, 2048), Image.Resampling.LANCZOS)
                else:
                    roi_processed = roi_processed.resize((1024, 1024), Image.Resampling.LANCZOS)

                # Save individual icon
                icon_name = f"icon_{i+1:02d}.png"
                icon_path = os.path.join(session_dir, icon_name)
                roi_processed.save(icon_path)
                
                # Add to ZIP
                zip_file.write(icon_path, icon_name)
                
                # Create relative URL for frontend
                # In production, this would be a full URL
                results.append({
                    "url": f"/static/outputs/{session_id}/{icon_name}",
                    "name": icon_name
                })

        return {
            "zipUrl": f"/static/outputs/{session_id}/{zip_filename}",
            "images": results
        }

    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health():
    return {"status": "ok", "engine": "OpenCV + rembg"}

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
