

# Define image processing settings
IMG_SIZE = (128, 128)  # Adjust according to your model's expected input size

# Dictionary mapping model names to their respective class labels
CLASS_NAMES = {
    "FAVDD": [
        "Apple - Healthy",
        "Apple - Rotten",
        "Banana - Healthy",
        "Banana - Rotten",
        "Orange - Healthy",
        "Orange - Rotten",
        "Strawberry - Healthy",
        "Strawberry - Rotten",
        "Mango - Healthy",
        "Mango - Rotten",
        "Potato - Healthy",
        "Potato - Rotten",
        "Tomato - Healthy",
        "Tomato - Rotten",
        "Cucumber - Healthy",
        "Cucumber - Rotten",
        "Carrot - Healthy",
        "Carrot - Rotten",
        "Bell Pepper - Healthy",
        "Bell Pepper - Rotten",
        "Grape - Healthy",
        "Grape - Rotten",
        "Pineapple - Healthy",
        "Pineapple - Rotten",
        "Watermelon - Healthy",
        "Watermelon - Rotten",
        "Kiwi - Healthy",
        "Kiwi - Rotten",
    ],
    "Olive": [
        "Olive - Anthracnose",
        "Olive - Healthy",
    ],
    "Apple": [
        "Apple - Healthy",
        "Apple - Rotten",
        "Apple - Blotch",
        "Apple - Scab",
        # "Apple - Black Rot",
        # "Apple - Cedar Apple Rust",
    ],
    "Citrus": [
        "Citrus - Black-Spot",
        "Citrus - Canker",
        "Citrus - Healthy",
    ],
    "Potato": [
        "Potato - Healthy",
    ],
    "Tomato": [
        "Tomato - Healthy",
        "Tomato - Rotten",
        # "Tomato - Bacterial Spot",
        # "Tomato - Blight",
        # "Tomato - Leaf Mold",
        # "Tomato - Septoria",
        # "Tomato - Spider Mites",
        # "Tomato - Target Spot",
        # "Tomato - Yellow Leaf Curl Virus",
    ],
    # Add more models and their class names as needed
}
