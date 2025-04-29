

import math
import cv2
from fastapi import HTTPException
import tensorflow as tf
import numpy as np
import os

# Function to load the selected model
def load_selected_model(model_name: str):
    model_path = os.path.join(os.path.dirname(__file__), 'models', f'{model_name}.keras')
    if not os.path.exists(model_path):
        raise HTTPException(status_code=404, detail=f"Model '{model_name}' not found.")
    try:
        return tf.keras.models.load_model(model_path)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to load model '{model_name}': {str(e)}")

def generate_gradcam(model, img_array, pred_index=None):
    """Generate Grad-CAM heatmap for the given image using the specified model."""
    # Create a model that maps the input image to the activations of the last conv layer
    last_conv_layer = next(layer for layer in reversed(model.layers) 
                           if isinstance(layer, tf.keras.layers.Conv2D))
    last_conv_layer_model = tf.keras.Model(model.inputs, last_conv_layer.output)
    
    # Create a model that maps the activations of the last conv layer to the final class predictions
    classifier_input = tf.keras.Input(shape=last_conv_layer.output.shape[1:])
    x = classifier_input
    for layer in model.layers[model.layers.index(last_conv_layer) + 1:]:
        x = layer(x)
    classifier_model = tf.keras.Model(classifier_input, x)
    
    # Watch the gradients
    with tf.GradientTape() as tape:
        # Compute activations of the last conv layer and make the tape watch it
        last_conv_layer_output = last_conv_layer_model(img_array)
        tape.watch(last_conv_layer_output)
        # Compute class predictions
        preds = classifier_model(last_conv_layer_output)
        if pred_index is None:
            pred_index = tf.argmax(preds[0])
        # This is the output we want to maximize
        class_channel = preds[:, pred_index]
    
    # Gradient of the target class with regard to the output feature map
    grads = tape.gradient(class_channel, last_conv_layer_output)
    
    # Vector where each entry is the mean intensity of the gradient over a channel
    pooled_grads = tf.reduce_mean(grads, axis=(0, 1, 2))
    
    # Weight the channels by the computed gradient values
    last_conv_layer_output = last_conv_layer_output.numpy()[0]
    pooled_grads = pooled_grads.numpy()
    for i in range(pooled_grads.shape[-1]):
        last_conv_layer_output[:, :, i] *= pooled_grads[i]
    
    # Average over all channels
    heatmap = np.mean(last_conv_layer_output, axis=-1)
    
    # ReLU thresholding
    heatmap = np.maximum(heatmap, 0) / np.max(heatmap)
    
    return heatmap

def apply_heatmap(img_array, heatmap, alpha=0.4):
    """Apply the heatmap over the original image."""
    # Resize heatmap to match image dimensions
    heatmap = cv2.resize(heatmap, (img_array.shape[2], img_array.shape[1]))
    
    # Convert heatmap to RGB
    heatmap = np.uint8(255 * heatmap)
    heatmap = cv2.applyColorMap(heatmap, cv2.COLORMAP_JET)
    
    # Convert original image from preprocessing format to RGB for overlay
    orig_img = (img_array[0] * 255).astype(np.uint8)
    if orig_img.shape[-1] == 1:  # If grayscale
        orig_img = cv2.cvtColor(orig_img, cv2.COLOR_GRAY2RGB)
    
    # Superimpose the heatmap on original image
    superimposed_img = heatmap * alpha + orig_img
    superimposed_img = np.clip(superimposed_img, 0, 255).astype(np.uint8)
    
    return superimposed_img

# Helper function to format file size
def format_file_size(bytes):
    if bytes == 0:
        return "0 Bytes"
    
    sizes = ["Bytes", "KB", "MB", "GB"]
    i = int(math.floor(math.log(bytes, 1024)))
    p = math.pow(1024, i)
    s = round(bytes / p, 2)
    
    return f"{s} {sizes[i]}"
