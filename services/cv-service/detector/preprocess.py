import cv2
import numpy as np

def preprocess_image(image_bytes: bytes) -> np.ndarray:
    """
    Convert raw image bytes to a cleaned, resized OpenCV image
    """
    # Convert bytes to numpy array
    np_array = np.frombuffer(image_bytes, np.uint8)
    
    # Decode image
    img = cv2.imdecode(np_array, cv2.IMREAD_COLOR)
    
    if img is None:
        raise ValueError("Could not decode image")
    
    # Resize to standard size
    img = cv2.resize(img, (480, 480))
    
    # Apply slight blur to reduce noise
    img = cv2.GaussianBlur(img, (5, 5), 0)
    
    return img


def extract_face_grid(img: np.ndarray) -> list:
    """
    Divide the image into a 3x3 grid and return
    the center pixel region of each of the 9 cells
    """
    h, w = img.shape[:2]
    
    cell_h = h // 3
    cell_w = w // 3
    
    cells = []
    
    for row in range(3):
        for col in range(3):
            # Get boundaries of this cell
            y1 = row * cell_h
            y2 = y1 + cell_h
            x1 = col * cell_w
            x2 = x1 + cell_w
            
            # Take only the center 50% of each cell (avoids edges)
            cy1 = y1 + cell_h // 4
            cy2 = y2 - cell_h // 4
            cx1 = x1 + cell_w // 4
            cx2 = x2 - cell_w // 4
            
            center_region = img[cy1:cy2, cx1:cx2]
            cells.append(center_region)
    
    return cells