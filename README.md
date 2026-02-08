Blockchain Transaction Explainer

A student-friendly web application that explains Ethereum blockchain transactions in simple English. Users can paste a transaction hash and get an easy-to-understand explanation of what happened in that transaction. This project is developed as a college mini project using Python (Flask) for the backend and HTML, CSS, and JavaScript for the frontend.

Features

Enter any Ethereum transaction hash

Two modes: Beginner mode (simple explanation) and Expert mode (technical explanation)

Displays sender address, receiver address, amount, gas used, transaction type, timestamp, and status

Generates a simple English explanation of the transaction

Stores the last searched transaction in the browser

Optional search history using browser localStorage

Fetches real blockchain data using Etherscan API

Scaledown API integration placeholder for future text optimization

Tech Stack

Backend: Python, Flask
Frontend: HTML, Tailwind CSS, JavaScript
APIs: Etherscan API, Scaledown API (optional)
Tools: Git, GitHub

Project Structure

blockchain_transaction_explainer/
├── run.py
├── backend/
│ ├── app.py
│ ├── config.py
│ ├── routes/
│ │ └── explain.py
│ └── services/
│ ├── etherscan.py
│ ├── explanation.py
│ └── scaledown.py
├── frontend/
│ ├── templates/
│ │ └── index.html
│ └── static/
│ ├── css/
│ │ └── style.css
│ └── js/
│ └── main.js
└── README.md

Setup Instructions

Install required Python packages:

pip install flask requests python-dotenv

Add your API keys in backend/config.py:

ETHERSCAN_API_KEY = "YOUR_ETHERSCAN_API_KEY"
SCALEDOWN_API_KEY = "YOUR_SCALEDOWN_API_KEY" (optional)

You can get an Etherscan API key from: https://etherscan.io/apis

Run the project:

python run.py

Open your browser and go to:

http://127.0.0.1:5000

How to Use

Open the website

Paste an Ethereum transaction hash (starts with 0x...)

Choose Beginner or Expert mode

Click "Explain Transaction"

Read the transaction details and the simple explanation

Example

Input:
0xe7ecba29a4cad8a617a7c5144059946a047f4ef1206debbd31a18e2eba60209e

Output:
The app shows sender, receiver, amount, gas used, timestamp, status, and gives a simple English explanation like:
"This transaction sent X ETH from A to B. Think of it like a digital bank transfer."

Known Limitations

Scaledown API may fail if the endpoint is unreachable (handled safely in code)

Search history uses browser localStorage, not a database

This project is for educational and demonstration purposes only

Academic Purpose

This project is created as a college mini project to demonstrate:

API integration

Flask backend development

Frontend and backend connection

Use of real blockchain data

Proper project structure and documentation

Author

Satyajith
GitHub: https://github.com/Satyajith2424

License

This project is for educational purposes only.
