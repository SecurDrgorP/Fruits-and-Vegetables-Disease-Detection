
import io
import uvicorn
from fastapi import FastAPI, File, UploadFile, Form, Request, Query
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
import numpy as np
import base64
from io import BytesIO
from PIL import Image
from typing import Optional

from config import CLASS_NAMES, IMG_SIZE
from utils import (
    apply_heatmap, 
    format_file_size, 
    generate_gradcam, 
    load_selected_model
    )
from database import db

app = FastAPI()

# Mount static files (CSS, JS, images, etc.)
app.mount("/static", StaticFiles(directory="static"), name="static")

templates = Jinja2Templates(directory="templates")

# Add custom filter for safe number formatting
def safe_float_format(value, decimals=1):
    """Safely format a value as float with specified decimals"""
    try:
        if value is None:
            return "0.0"
        return f"{float(value):.{decimals}f}"
    except (ValueError, TypeError):
        return "0.0"

# Add the filter to Jinja2 environment
templates.env.filters['safe_float'] = safe_float_format


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
        
        # Save prediction to database
        db.save_prediction(
            model_name=model,
            predicted_class=predicted_class,
            confidence=confidence,
            file_name=file.filename,
            file_size=file_size,
            file_type=file_type,
            image_data=image_data,
            heatmap_data=heatmap_data
        )
        
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
        "file_type": file_type,
        "confidence": confidence if 'confidence' in locals() else None,
        "predicted_class": predicted_class if 'predicted_class' in locals() else None
    })


@app.get("/history", response_class=HTMLResponse)
async def history(request: Request, page: int = Query(1, ge=1)):
    """Display prediction history with pagination"""
    page_size = 20
    offset = (page - 1) * page_size
    
    predictions = db.get_prediction_history(limit=page_size, offset=offset)
    statistics = db.get_prediction_statistics()
    
    return templates.TemplateResponse("history.html", {
        "request": request,
        "predictions": predictions,
        "statistics": statistics,
        "current_page": page,
        "has_next": len(predictions) == page_size
    })


@app.get("/history/{prediction_id}")
async def get_prediction_detail(prediction_id: int):
    """Get detailed information about a specific prediction"""
    prediction = db.get_prediction_by_id(prediction_id)
    if prediction:
        return JSONResponse(content=prediction)
    return JSONResponse(content={"error": "Prediction not found"}, status_code=404)


@app.get("/disease-guide", response_class=HTMLResponse)
async def disease_guide(request: Request, search: Optional[str] = None):
    """Display disease guide with search functionality"""
    diseases = db.get_disease_info(search)
    
    return templates.TemplateResponse("disease_guide.html", {
        "request": request,
        "diseases": diseases,
        "search_query": search or ""
    })


@app.get("/settings", response_class=HTMLResponse)
async def settings(request: Request):
    """Display application settings"""
    return templates.TemplateResponse("settings.html", {
        "request": request,
        "models": CLASS_NAMES.keys()
    })


@app.get("/api/statistics")
async def get_statistics():
    """API endpoint to get prediction statistics"""
    return JSONResponse(content=db.get_prediction_statistics())


@app.delete("/api/history/clear")
async def clear_history():
    """API endpoint to clear prediction history"""
    try:
        # Clear all predictions from database
        import sqlite3
        conn = sqlite3.connect(db.db_path)
        cursor = conn.cursor()
        cursor.execute('DELETE FROM predictions')
        conn.commit()
        conn.close()
        
        return JSONResponse(content={"message": "History cleared successfully"})
    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)


@app.delete("/api/prediction/{prediction_id}")
async def delete_prediction(prediction_id: int):
    """API endpoint to delete a specific prediction"""
    try:
        import sqlite3
        conn = sqlite3.connect(db.db_path)
        cursor = conn.cursor()
        cursor.execute('DELETE FROM predictions WHERE id = ?', (prediction_id,))
        
        if cursor.rowcount == 0:
            return JSONResponse(content={"error": "Prediction not found"}, status_code=404)
        
        conn.commit()
        conn.close()
        
        return JSONResponse(content={"message": "Prediction deleted successfully"})
    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)


@app.get("/api/history/export")
async def export_history():
    """API endpoint to export prediction history as CSV"""
    try:
        import csv
        import io
        from fastapi.responses import StreamingResponse
        
        predictions = db.get_prediction_history(limit=1000)
        
        output = io.StringIO()
        writer = csv.writer(output)
        
        # Write header
        writer.writerow(['Date', 'Model', 'Prediction', 'Confidence', 'File Name', 'File Size', 'File Type'])
        
        # Write data
        for pred in predictions:
            writer.writerow([
                pred['timestamp'],
                pred['model_name'],
                pred['predicted_class'],
                pred['confidence'],
                pred['file_name'],
                pred['file_size'],
                pred['file_type']
            ])
        
        output.seek(0)
        
        return StreamingResponse(
            io.BytesIO(output.getvalue().encode()),
            media_type="text/csv",
            headers={"Content-Disposition": "attachment; filename=prediction_history.csv"}
        )
    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)


@app.delete("/api/data/clear-all")
async def clear_all_data():
    """API endpoint to clear all application data"""
    try:
        import sqlite3
        import os
        
        # Clear database
        conn = sqlite3.connect(db.db_path)
        cursor = conn.cursor()
        cursor.execute('DELETE FROM predictions')
        cursor.execute('DELETE FROM disease_info')
        conn.commit()
        conn.close()
        
        # Reinitialize disease info
        db.populate_disease_info()
        
        return JSONResponse(content={"message": "All data cleared successfully"})
    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)


@app.get("/api/models/info")
async def get_models_info():
    """API endpoint to get model information"""
    models_info = {}
    
    for model_name in CLASS_NAMES.keys():
        models_info[model_name] = {
            "version": "1.0.0",
            "accuracy": "94.2",  # This would normally come from model metadata
            "lastUpdated": "2024-12-15"
        }
    
    return JSONResponse(content=models_info)


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
