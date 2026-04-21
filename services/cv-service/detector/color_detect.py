import cv2
import numpy as np


# Color definitions in HSV space
# Each color has a range [lower, upper]
# H: 0-179, S: 0-255, V: 0-255
COLOR_RANGES = {
    0: {"name": "white",  "lower": np.array([0,   0,   180]), "upper": np.array([179, 60,  255])},
    1: {"name": "orange", "lower": np.array([5,   100, 100]), "upper": np.array([20,  255, 255])},
    2: {"name": "green",  "lower": np.array([45,  80,  80]),  "upper": np.array([85,  255, 255])},
    3: {"name": "red",    "lower": np.array([0,   100, 100]), "upper": np.array([5,   255, 255])},
    4: {"name": "blue",   "lower": np.array([95,  80,  80]),  "upper": np.array([135, 255, 255])},
    5: {"name": "yellow", "lower": np.array([22,  100, 100]), "upper": np.array([44,  255, 255])},
}

# Red wraps around in HSV so we need a second range
RED_LOWER2 = np.array([170, 100, 100])
RED_UPPER2 = np.array([179, 255, 255])


def detect_cell_color(cell_img: np.ndarray) -> int:
    """
    Given a cell image (numpy array), return the color index 0-5
    0=white, 1=orange, 2=green, 3=red, 4=blue, 5=yellow
    """
    # Convert to HSV
    hsv = cv2.cvtColor(cell_img, cv2.COLOR_BGR2HSV)
    
    best_color = 0
    best_count = 0
    
    for color_id, color_info in COLOR_RANGES.items():
        mask = cv2.inRange(hsv, color_info["lower"], color_info["upper"])
        
        # Red has two ranges in HSV — add second range
        if color_id == 3:
            mask2 = cv2.inRange(hsv, RED_LOWER2, RED_UPPER2)
            mask = cv2.bitwise_or(mask, mask2)
        
        count = cv2.countNonZero(mask)
        
        if count > best_count:
            best_count = count
            best_color = color_id
    
    return best_color


def detect_face_colors(cells: list) -> list:
    """
    Given a list of 9 cell images, return list of 9 color indices
    """
    return [detect_cell_color(cell) for cell in cells]