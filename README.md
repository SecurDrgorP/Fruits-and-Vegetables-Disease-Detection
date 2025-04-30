# Fruits and Vegetables Disease Detection

An AI-powered web application that identifies diseases in fruits and vegetables using computer vision and machine learning.

## 📋 Overview

This project provides an easy-to-use interface for farmers, gardeners, and agricultural professionals to quickly identify diseases in plants by uploading images. Using deep learning models, the system analyzes images and returns disease detection results along with treatment recommendations.

## ✨ Features

- **Disease Detection**: Upload images of fruits and vegetables to detect diseases
- **FastAPI Backend**: Efficient, asynchronous API handling
- **Interactive UI**: Simple and responsive interface for image uploading and results
- **Treatment Recommendations**: Get advice on how to address detected plant diseases
- **Support for Multiple Crops**: Detection for common fruits and vegetables

## 🛠️ Tech Stack

- **Backend**: FastAPI
- **Machine Learning**: TensorFlow, GRAD-CAM
- **Image Processing**: OpenCV, Pillow
- **Data Handling**: NumPy, Pandas
- **Visualization**: Matplotlib
- **Frontend**: Jinja2 templates

## 🚀 Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/Fruits-and-Vegetables-Disease-Detection.git
cd Fruits-and-Vegetables-Disease-Detection

# Create a virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Download model weights (if not included in repo)
# Instructions would go here
```

## 💻 Usage

```bash
# Start the FastAPI server
uvicorn main:app --reload
```

Then navigate to `http://localhost:8000` in your browser.

## 🔄 API Endpoints

- `GET /`: Home page
- `POST /predict`: Upload an image and get disease detection results
- `GET /docs`: Swagger documentation for the API

## 🧠 Model Information

The application uses a convolutional neural network trained on a dataset of healthy and diseased plant images. The model can identify common diseases in:

- Tomatoes
- Potatoes
- Apples
- Citrus
- And more...

## 📁 Project Structure

```
Fruits-and-Vegetables-Disease-Detection/
├── main.py                # FastAPI application entry point
├── models/                # ML model files
├── static/                # CSS, JS, and static assets
├── templates/             # Jinja2 HTML templates
├── utils/                 # Utility functions
├── requirements.txt       # Project dependencies
└── README.md              # Project documentation
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

*This project was developed as part of a Software Development Project course.*
