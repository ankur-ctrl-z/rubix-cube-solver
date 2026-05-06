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
    Uses a decision tree approach — order matters here
    """

    # WHITE — must check first
    # White has very low saturation regardless of hue
    if s < 60 and v > 160:
        return 0  # white

    # YELLOW — bright, medium-high saturation, specific hue
    if 18 <= h <= 48 and s > 80 and v > 120:
        return 5  # yellow

    # ORANGE — low hue, high saturation
    if 5 <= h <= 22 and s > 100:
        return 1  # orange

    # GREEN — mid hue range
    if 40 <= h <= 90 and s > 80:
        return 2  # green

    # BLUE — high hue range
    if 85 <= h <= 140 and s > 60:
        return 4  # blue

    # RED — wraps around 0/180 in HSV
    if (h <= 10 or h >= 160) and s > 80:
        return 3  # red

    # ── FALLBACK ──
    # If nothing matched, find nearest color by hue distance
    # but handle white separately first
    if s < 80:
        return 0  # low saturation = white

    # Find nearest hue
    hue_centers = {
        1: 12,   # orange
        2: 65,   # green
        3: 0,    # red
        4: 112,  # blue
        5: 30,   # yellow
    }

    nearest = min(hue_centers, key=lambda c: min(
        abs(hue_centers[c] - h),
        abs(hue_centers[c] - h + 180),
        abs(hue_centers[c] - h - 180)
    ))
    return nearest