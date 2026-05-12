import cv2
import numpy as np


def detect_face_colors(cells: list) -> list:
    """
    Given a list of 9 cell images, return list of 9 color indices
    0=white, 1=orange, 2=green, 3=red, 4=blue, 5=yellow
    """
    return [detect_cell_color(cell) for cell in cells]


def detect_cell_color(cell_img: np.ndarray) -> int:
    """
    Detect color using average HSV of center pixels
    """
    # Use only center 60% of cell to avoid edge noise
    h, w = cell_img.shape[:2]
    margin_h = h // 5
    margin_w = w // 5
    center = cell_img[margin_h:h-margin_h, margin_w:w-margin_w]

    hsv = cv2.cvtColor(center, cv2.COLOR_BGR2HSV)

    # Get average HSV values
    avg = cv2.mean(hsv)
    hue, sat, val = avg[0], avg[1], avg[2]

    return classify_color(hue, sat, val)


def classify_color(h: float, s: float, v: float) -> int:
    """
    Classify HSV values into one of 6 cube colors
    Based on actual measured HSV values:
    - Red:    H=0-1,   S~247
    - Orange: H=10-12, S~243
    - Green:  H=63-68, S~248
    - Blue:   H=102-104, S~249
    - Yellow: H=29-32, S~236
    - White:  H=any,   S<20, V>170
    """

    # WHITE — very low saturation
    if s < 25 and v > 160:
        return 0  # white

    # RED — hue 0-9, very high saturation
    if (h <= 9 or h >= 165) and s > 200:
        return 3  # red

    # ORANGE — hue 9.5-22, high saturation
    if 9.5 <= h <= 22 and s > 200:
        return 1  # orange

    # YELLOW — hue 28-35, high saturation
    if 28 <= h <= 38 and s > 200:
        return 5  # yellow

    # GREEN — hue 60-70, high saturation
    if 58 <= h <= 75 and s > 200:
        return 2  # green

    # BLUE — hue 95-110, high saturation
    if 95 <= h <= 115 and s > 200:
        return 4  # blue

    # FALLBACK — low saturation = white
    if s < 60:
        return 0

    # Find nearest by hue
    hue_centers = {
        1: 11,   # orange
        2: 65,   # green
        3: 1,    # red
        4: 103,  # blue
        5: 31,   # yellow
    }

    nearest = min(hue_centers, key=lambda c: min(
        abs(hue_centers[c] - h),
        abs(hue_centers[c] - h + 180),
        abs(hue_centers[c] - h - 180)
    ))
    return nearest 