import requests
import datetime
from backend.config import Config

# New Etherscan v2 base URL
ETHERSCAN_BASE_URL = "https://api.etherscan.io/v2/api"

def fetch_transaction_data(tx_hash):
    try:
        # 1. Get transaction by hash (Ethereum mainnet = chainid 1)
        tx_params = {
            "chainid": 1,
            "module": "proxy",
            "action": "eth_getTransactionByHash",
            "txhash": tx_hash,
            "apikey": Config.ETHERSCAN_API_KEY
        }
        tx_res = requests.get(ETHERSCAN_BASE_URL, params=tx_params, timeout=10)
        tx_json = tx_res.json()
        tx_data = tx_json.get("result")

        if not isinstance(tx_data, dict):
            return None, "Invalid transaction hash or Etherscan API error"

        # 2. Get transaction receipt
        receipt_params = {
            "chainid": 1,
            "module": "proxy",
            "action": "eth_getTransactionReceipt",
            "txhash": tx_hash,
            "apikey": Config.ETHERSCAN_API_KEY
        }
        receipt_res = requests.get(ETHERSCAN_BASE_URL, params=receipt_params, timeout=10)
        receipt_json = receipt_res.json()
        receipt_data = receipt_json.get("result")

        if not isinstance(receipt_data, dict):
            return None, "Could not fetch transaction receipt"

        # 3. Get block for timestamp
        block_params = {
            "chainid": 1,
            "module": "proxy",
            "action": "eth_getBlockByNumber",
            "tag": tx_data.get("blockNumber"),
            "boolean": "false",
            "apikey": Config.ETHERSCAN_API_KEY
        }
        block_res = requests.get(ETHERSCAN_BASE_URL, params=block_params, timeout=10)
        block_json = block_res.json()
        block_data = block_json.get("result")

        if not isinstance(block_data, dict):
            return None, "Could not fetch block data"

        timestamp_hex = block_data.get("timestamp")
        timestamp_int = int(timestamp_hex, 16)
        timestamp_str = datetime.datetime.fromtimestamp(timestamp_int).strftime("%Y-%m-%d %H:%M:%S")

        return {
            "transaction": tx_data,
            "receipt": receipt_data,
            "block": block_data,
            "timestamp": timestamp_str
        }, None

    except Exception as e:
        return None, str(e)
