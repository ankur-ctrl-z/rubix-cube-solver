import cv2
import numpy as np


COLOR_RANGES = {
    0: {"name": "white",  "lower": np.array([0,   0,   190]), "upper": np.array([179, 45,  255])},
    1: {"name": "orange", "lower": np.array([5,   120, 120]), "upper": np.array([20,  255, 255])},
    2: {"name": "green",  "lower": np.array([40,  80,  80]),  "upper": np.array([90,  255, 255])},
    3: {"name": "red",    "lower": np.array([0,   120, 120]), "upper": np.array([6,   255, 255])},
    4: {"name": "blue",   "lower": np.array([90,  80,  80]),  "upper": np.array([140, 255, 255])},
    5: {"name": "yellow", "lower": np.array([20,  100, 100]), "upper": np.array([45,  255, 255])},
}

RED_LOWER2 = np.array([165, 120, 120])
RED_UPPER2 = np.array([179, 255, 255])


def detect_cell_color(cell_img: np.ndarray) -> int:
    """
    Detect color using HSV ranges + fallback to average HSV
    """
    hsv = cv2.cvtColor(cell_img, cv2.COLOR_BGR2HSV)

    scores = {}
    total_pixels = hsv.shape[0] * hsv.shape[1]

    for color_id, color_info in COLOR_RANGES.items():
        mask = cv2.inRange(hsv, color_info["lower"], color_info["upper"])
        if color_id == 3:  # red wraps in HSV
            mask2 = cv2.inRange(hsv, RED_LOWER2, RED_UPPER2)
            mask = cv2.bitwise_or(mask, mask2)
        scores[color_id] = cv2.countNonZero(mask)

    best_color = max(scores, key=scores.get)
    best_score = scores[best_color]

    # If no color matched well (less than 5% pixels)
    # use average HSV to find nearest color
    if best_score < total_pixels * 0.05:
        best_color = detect_by_average_hsv(hsv)

    return best_color


def detect_by_average_hsv(hsv: np.ndarray) -> int:
    """
    Fallback: compute average HSV and find nearest color
    """
    avg = cv2.mean(hsv)
    h, s, v = avg[0], avg[1], avg[2]

    # White — low saturation, high brightness
    if s < 50 and v > 180:
        return 0

    # Yellow — specific hue range
    if 20 <= h <= 45 and s > 80:
        return 5

    # Orange
    if 5 <= h <= 20 and s > 100:
        return 1

    # Green
    if 40 <= h <= 90 and s > 60:
        return 2

    # Blue
    if 90 <= h <= 140 and s > 60:
        return 4

    # Red (wraps around)
    if (h <= 6 or h >= 165) and s > 100:
        return 3

    # Default nearest hue
    color_centers = {
        1: 12, 2: 65, 3: 2, 4: 115, 5: 33
    }
    return min(color_centers, key=lambda c: abs(color_centers[c] - h))


def detect_face_colors(cells: list) -> list:
    """
    Given a list of 9 cell images, return list of 9 color indices
    0=white, 1=orange, 2=green, 3=red, 4=blue, 5=yellow
    """
    return [detect_cell_color(cell) for cell in cells]