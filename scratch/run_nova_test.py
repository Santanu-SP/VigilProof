import os
import sys
from unittest.mock import patch

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../services/ai-extractor')))

from extractor import extract_evidence
from PIL import Image, ImageDraw, ImageFont
import io

def create_synthetic_screenshot():
    img = Image.new('RGB', (800, 400), color=(255, 255, 255))
    d = ImageDraw.Draw(img)
    
    try:
        font = ImageFont.truetype("arial.ttf", 24)
    except IOError:
        font = ImageFont.load_default()
        
    text = (
        "Security Alert\n"
        "Your account will be blocked tonight.\n"
        "Verify at https://example.com/verify\n"
        "Pay Rs. 10,000 immediately."
    )
    
    d.text((20, 20), text, fill=(0, 0, 0), font=font)
    
    byte_arr = io.BytesIO()
    img.save(byte_arr, format='JPEG')
    return byte_arr.getvalue()

@patch('extractor._download_image_bytes')
def run_real_test(mock_download):
    mock_download.return_value = (create_synthetic_screenshot(), "jpeg")
    
    print("Running real Nova test with synthetic screenshot...")
    try:
        evidence = extract_evidence("s3://fake-bucket/fake-key.jpg")
        print("\nExtracted Evidence:")
        print(evidence.model_dump_json(indent=2))
    except Exception as e:
        print(f"Error during extraction: {e}")

if __name__ == "__main__":
    run_real_test()
