import os

class Config:
    ETHERSCAN_API_KEY = os.environ.get('ETHERSCAN_API_KEY', '4TVR12544JNZ3XQYBZ36KS7TCDVTNMKTZP')
    SCALEDOWN_API_KEY = os.environ.get('SCALEDOWN_API_KEY', 'y8A8Wuq9n89xGF3LE9XZz7hV2kJVKQrR2MdZwcDk')
    ETHERSCAN_BASE_URL = "https://api.etherscan.io/api"
    SCALEDOWN_API_URL = "https://api.scaledown.ai/v1/compress"
