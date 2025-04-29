
import io
import uvicorn
from fastapi import FastAPI, File, UploadFile, Form, Request
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
import numpy as np
import base64
from io import BytesIO
from PIL import Image

from config import CLASS_NAMES, IMG_SIZE
from utils import (
    apply_heatmap, 
    format_file_size, 
    generate_gradcam, 
    load_selected_model
    )

app = FastAPI()

# Mount static files (CSS, JS, images, etc.)
app.mount("/static", StaticFiles(directory="static"), name="static")

templates = Jinja2Templates(directory="templates")


@app.get("/", response_class=HTMLResponse)
async def index(request: Request):
    return templates.TemplateResponse("index.html", {"request": request, "models": CLASS_NAMES.keys()})


@app.post("/")
async def create_upload_file(request: Request, file: UploadFile = File(...), model: str = Form(...)):
    if model not in CLASS_NAMES:
        return templates.TemplateResponse("index.html", {
            "request": request, 
            "result": f"Model '{model}' is not recognized.", 
            "models": CLASS_NAMES.keys()
        })
    
    try:
        # Load the selected model
        selected_model = load_selected_model(model)
        
        # Read the uploaded image file
        contents = await file.read()
        
        # Save original image data
        img_io = BytesIO()
        original_img = Image.open(BytesIO(contents))
        original_img.save(img_io, format=original_img.format)
        img_io.seek(0)
        encoded_image = base64.b64encode(img_io.read()).decode("utf-8")
        image_data = f"data:{file.content_type};base64,{encoded_image}"
        
        # Get file info
        file_size = len(contents)
        file_type = file.content_type
        
        # For prediction, we need to seek back to beginning of file
        await file.seek(0)
        contents = await file.read()
        
        image = Image.open(io.BytesIO(contents)).convert("RGB")
        image = image.resize(IMG_SIZE)
        image_array = np.array(image) / 255.0  # Normalize the image
        image_array = np.expand_dims(image_array, axis=0)
        
        # Get prediction from the model
        predictions = selected_model.predict(image_array)
        predicted_class_index = np.argmax(predictions[0])
        confidence = np.max(predictions[0]) * 100
        
        # Retrieve the class label
        class_labels = CLASS_NAMES[model]
        if predicted_class_index < len(class_labels):
            predicted_class = class_labels[predicted_class_index]
            result = f"Prediction: {predicted_class} (Confidence: {confidence:.2f}%)"
        else:
            result = "Error: Predicted class index out of range."
            
        # Generate Grad-CAM heatmap
        heatmap = generate_gradcam(selected_model, image_array, predicted_class_index)
        
        # Apply heatmap to the original image
        superimposed_img = apply_heatmap(image_array, heatmap)
        
        # Convert heatmap image to base64
        heatmap_img = Image.fromarray(superimposed_img)
        heatmap_io = BytesIO()
        heatmap_img.save(heatmap_io, format='PNG')
        heatmap_io.seek(0)
        heatmap_data = base64.b64encode(heatmap_io.read()).decode('utf-8')
        heatmap_data = f"data:image/png;base64,{heatmap_data}"
        
    except Exception as e:
        result = f"Error: {str(e)}"
        image_data = None
        file_size = 0
        file_type = ""
        heatmap_data = None
    
    # Return the template with all necessary data
    return templates.TemplateResponse("index.html", {
        "request": request, 
        "result": result, 
        "models": CLASS_NAMES.keys(),
        "image_data": image_data,
        "heatmap_data": heatmap_data,
        "file_name": file.filename,
        "file_size": format_file_size(file_size),
        "file_type": file_type
    })


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
