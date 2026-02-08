# Blockchain Transaction Explainer

A full-stack Flask application that explains Ethereum transactions in plain English (Beginner Mode) or technical detail (Expert Mode). It integrates Etherscan API for data fetching and Scaledown API for explanation optimization.

## Project Structure

```
blockchain_transaction_explainer/
├── backend/
│   ├── app.py                # Flask application factory
│   ├── config.py             # Configuration and API keys
│   ├── requirements.txt      # Python dependencies
│   ├── services/             # Business logic
│   │   ├── etherscan.py      # Etherscan data fetching
│   │   ├── scaledown.py      # Scaledown API integration
│   │   └── explanation.py    # Explanation text generation
│   └── routes/
│       └── explain.py        # API routes
│
├── frontend/
│   ├── templates/
│   │   └── index.html        # Main UI
│   └── static/
│       ├── css/
│       │   └── style.css     # Styles
│       └── js/
│           └── main.js       # Frontend logic
│
└── run.py                    # Entry point script
```

## Setup Instructions

1.  **Install Dependencies**:
    Navigate to the project directory and install the required packages.
    ```bash
    cd blockchain_transaction_explainer
    pip install -r backend/requirements.txt
    ```

2.  **Environment Variables**:
    Set your API keys. You can set them in your terminal or hardcode them in `backend/config.py` for testing (not recommended for production).
    
    **Windows (PowerShell)**:
    ```powershell
    $env:ETHERSCAN_API_KEY = "YourEtherscanKey"
    $env:SCALEDOWN_API_KEY = "YourScaledownKey"
    ```

    **Mac/Linux**:
    ```bash
    export ETHERSCAN_API_KEY="YourEtherscanKey"
    export SCALEDOWN_API_KEY="YourScaledownKey"
    ```

3.  **Run the Application**:
    ```bash
    python run.py
    ```

4.  **Access the App**:
    Open your browser and navigate to:
    `http://127.0.0.1:5000`

## Features

*   **Transaction Decoding**: Fetches real-time data from Etherscan.
*   **Dual Modes**:
    *   **Beginner**: Analogies and simple terms.
    *   **Expert**: Technical details, gas, nonce, and raw data.
*   **AI Optimization**: Uses Scaledown API to refine and summarize the explanations.
*   **History**: locally stores your recent searches.
