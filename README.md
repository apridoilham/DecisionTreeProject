# 🌳 Smart Decision Tree

[](https://www.python.org/) [](https://flask.palletsprojects.com/) [](https://tailwindcss.com/) [](https://alpinejs.dev/)

A web application to build and visualize Decision Trees interactively. Built with a Python/Flask backend and a dynamic frontend using Alpine.js & Tailwind CSS.

## 🚀 Key Features

  - **Interactive Data Input**: Enter parameters and training datasets directly through the web interface.
  - **Real-time Visualization**: Instantly generate a decision tree diagram (dendrogram) after data submission.
  - **Visualization Controls**: Easily zoom, pan, and download the decision tree image.
  - **Example Data**: Load sample data with a single click to quickly test the application's functionality.
  - **Process Log**: Track the steps taken by the algorithm to build the tree through a dedicated log panel.
  - **Modern Design**: A clean, responsive, and modern interface with a light theme.

## 🛠️ Tech Stack

  - **Backend**: Python, Flask
  - **Frontend**: Tailwind CSS, Alpine.js
  - **Visualization**: Graphviz (used by Python)
  - **Core Logic**: Pandas, NumPy, Anytree

## ⚙️ Installation & Usage Guide

Follow these steps to run this project on your local machine.

### Prerequisites

  - [Python](https://www.python.org/downloads/) (version 3.11 or newer)
  - [Node.js](https://nodejs.org/) and npm (for compiling Tailwind CSS)
  - [Graphviz](https://graphviz.org/download/) (this must be installed on your system for visualization to work)

### Installation Steps

1.  **Clone this repository:**

    ```bash
    git clone [https://github.com/USERNAME/REPOSITORY_NAME.git](https://github.com/USERNAME/REPOSITORY_NAME.git)
    cd REPOSITORY_NAME
    ```

    *(Replace `USERNAME` and `REPOSITORY_NAME` with your own)*

2.  **Create and activate a virtual environment:**

    ```bash
    # Create the environment
    python3 -m venv .venv

    # Activate the environment (macOS/Linux)
    source .venv/bin/activate

    # Activate the environment (Windows)
    # .venv\Scripts\activate
    ```

3.  **Install Python dependencies:**

    ```bash
    pip install -r requirements.txt
    ```

4.  **Install Node.js dependencies:**

    ```bash
    npm install
    ```

5.  **Compile (build) the Tailwind CSS file:**

    ```bash
    # For a one-time build (production)
    npm run build

    # Or, for development (automatically rebuilds on changes)
    npm run dev
    ```

6.  **Run the Flask application:**

    ```bash
    flask run
    ```

7.  **Open the application:**
    Open your browser and navigate to `http://127.0.0.1:5000`.

### How to Use

1.  **Enter Parameters**: In the "Parameter List" field, enter the attribute names separated by commas. The last parameter will be treated as the target class.
2.  **Enter Dataset**: In the "Training Dataset" area, enter your data. Each row represents a data entry, and the values within it are separated by commas.
3.  **Build Tree**: Click the "Build Tree" button to process the data and see its visualization.
4.  **Use Example**: Click "Load Example" to automatically fill the form with sample data.

## 📁 Project Structure

/
├── .venv/
├── node_modules/
├── static/
│   ├── css/
│   │   ├── main.css      # Source Tailwind CSS file
│   │   └── output.css    # Compiled CSS file
│   └── js/
│       └── main.js       # Alpine.js frontend logic
├── templates/
│   └── index.html        # Main application page
├── .gitignore            # Ignores unnecessary files
├── app.py                # Main Flask application
├── package.json          # Node.js dependencies
├── postcss.config.js
├── README.md
├── requirements.txt      # Python dependencies
└── tailwind.config.js    # Tailwind CSS configuration