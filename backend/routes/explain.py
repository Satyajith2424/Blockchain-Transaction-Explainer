from flask import Blueprint, request, jsonify
from backend.services.etherscan import fetch_transaction_data
from backend.services.explanation import generate_initial_explanation
from backend.services.scaledown import optimize_explanation



explain_bp = Blueprint('explain', __name__)

@explain_bp.route('/explain', methods=['POST'])
def explain_transaction():

    data = request.get_json(force=True, silent=True)

    
    if not isinstance(data, dict):
        try:
            import json
            data = json.loads(request.data.decode("utf-8"))
        except Exception:
            return jsonify({"error": "Invalid JSON received from frontend"}), 400

    tx_hash = data.get("hash")
    mode = data.get("mode", "beginner")



    if not tx_hash:
        return jsonify({'error': 'Transaction hash is required'}), 400

    # 1. Fetch Data
    fetched_data, error = fetch_transaction_data(tx_hash)
    if error:
        return jsonify({'error': error}), 404

    tx_data = fetched_data['transaction']
    receipt_data = fetched_data['receipt']
    block_data = fetched_data['block']
    timestamp_str = fetched_data['timestamp']

    # 2. Process Values
    try:
        eth_value = int(tx_data['value'], 16) / 10**18
        gas_used = int(receipt_data['gasUsed'], 16)
        status = "Success" if receipt_data.get('status') == '0x1' else "Failed"
    except Exception as e:
        return jsonify({'error': f"Error parsing transaction data: {str(e)}"}), 500

    # 3. Generate Basic Explanation
    initial_text, tx_type = generate_initial_explanation(
        tx_data, receipt_data, eth_value, gas_used, status, timestamp_str, mode
    )

    # 4. Scaledown Optimization
    scaledown_data, final_explanation = optimize_explanation(initial_text, mode)

    # 5. Build Response
    response = {
        "hash": tx_hash,
        "from": tx_data['from'],
        "to": tx_data['to'],
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
    }

    return jsonify(response)
