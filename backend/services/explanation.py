def generate_initial_explanation(tx_data, receipt_data, eth_value, gas_used, status, timestamp_str, mode):
    input_data = tx_data.get("input", "0x")
    is_transfer = input_data == "0x" or input_data == "0x00"
    tx_type = "Transfer" if is_transfer else "Contract Interaction"

    if mode == "beginner":
        if is_transfer:
            text = (
                f"This transaction sent {eth_value} ETH from {tx_data['from']} to {tx_data['to']}. "
                f"It happened on {timestamp_str} and was {status.lower()}. "
                "Think of it like a digital bank transfer."
            )
        else:
            text = (
                f"This transaction interacted with a smart contract at {tx_data['to']}. "
                f"It used {gas_used} gas units and was {status.lower()}. "
                "This is like using a vending machine on the blockchain."
            )
    else:
        text = (
            f"Transaction invoked a {tx_type}. "
            f"Value: {eth_value} ETH. Gas Used: {gas_used}. "
            f"Timestamp: {timestamp_str}. Status: {status}."
        )

    return text, tx_type
