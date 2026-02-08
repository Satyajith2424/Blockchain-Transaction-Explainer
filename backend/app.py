from flask import Flask, render_template, request, jsonify

from backend.services.etherscan import fetch_transaction_data
from backend.services.explanation import generate_initial_explanation
from backend.services.scaledown import optimize_explanation

def create_app():
    app = Flask(
        __name__,
        template_folder="../frontend/templates",
        static_folder="../frontend/static"
    )

    @app.route("/")
    def index():
        return render_template("index.html")

    @app.route("/explain", methods=["POST"])
    def explain_transaction():
        data = request.get_json(force=True, silent=True)

        if not isinstance(data, dict):
            return jsonify({"error": "Invalid JSON received"}), 400

        tx_hash = data.get("hash")
        mode = data.get("mode", "beginner")

        if not tx_hash:
            return jsonify({"error": "Transaction hash is required"}), 400

        fetched_data, error = fetch_transaction_data(tx_hash)
        if error:
            return jsonify({"error": error}), 400

        tx_data = fetched_data["transaction"]
        receipt_data = fetched_data["receipt"]
        block_data = fetched_data["block"]
        timestamp_str = fetched_data["timestamp"]

        try:
            eth_value = int(tx_data.get("value", "0x0"), 16) / 10**18
            gas_used = int(receipt_data.get("gasUsed", "0x0"), 16)
        except Exception:
            return jsonify({"error": "Error parsing transaction values"}), 500

        status = "Success" if receipt_data.get("status") == "0x1" else "Failed"

        initial_text, tx_type = generate_initial_explanation(
            tx_data, receipt_data, eth_value, gas_used, status, timestamp_str, mode
        )

        scaledown_data, final_explanation = optimize_explanation(initial_text, mode)

        return jsonify({
            "hash": tx_hash,
            "from": tx_data.get("from"),
            "to": tx_data.get("to"),
            "amount": str(eth_value),
            "gasUsed": str(gas_used),
            "transactionType": tx_type,
            "status": status,
            "timestamp": timestamp_str,
            "explanation": final_explanation,
            "raw": {
                "transaction": tx_data,
                "receipt": receipt_data,
                "block": block_data
            },
            "scaledown": scaledown_data
        })

    return app


if __name__ == "__main__":
    app = create_app()
    app.run(debug=True)
