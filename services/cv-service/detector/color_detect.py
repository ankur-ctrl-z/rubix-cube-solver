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

    # WHITE — very low saturation
    if s < 60 and v > 150:
        return 0

    # RED — H=0-4 or H=170-180
    # ALL genuine red stickers have S > 200
    # TOP cell 3 has S=117 so won't match → goes to medium zone
    if (h <= 4 or h >= 170) and s > 150:
        return 3

    # ORANGE — H=5-22
    if 5 <= h <= 22 and s > 100:
        return 1

    # YELLOW — H=23-40
    if 23 <= h <= 40 and s > 100:
        return 5

    # GREEN — H=55-80
    if 55 <= h <= 80 and s > 100:
        return 2

    # BLUE — H=90-120
    if 90 <= h <= 120 and s > 100:
        return 4

    # MEDIUM SATURATION ZONE (S=60-150)
    # TOP cell 3: H=3.1, S=117 lands here
    # nearest hue to H=3.1 is orange(12) distance=8.9
    #                        red(2)   distance=1.1  ← still red!
    # We need to explicitly treat low-sat H≤4 as orange
    if 60 < s <= 150:
        # H=0-4 with low saturation is most likely
        # orange in shadow (not genuine red)
        if h <= 5 or h >= 170:
            return 1  # treat as orange

        hue_centers = {
            1: 12,   # orange
            5: 33,   # yellow
            2: 68,   # green
            4: 106,  # blue
        }
        nearest = min(hue_centers, key=lambda c: min(
            abs(hue_centers[c] - h),
            abs(hue_centers[c] - h + 180),
            abs(hue_centers[c] - h - 180)
        ))
        return nearest

    # FALLBACK
    if s < 80:
        return 0

    hue_centers = {3: 2, 1: 12, 5: 33, 2: 68, 4: 106}
    return min(hue_centers, key=lambda c: min(
        abs(hue_centers[c] - h),
        abs(hue_centers[c] - h + 180),
        abs(hue_centers[c] - h - 180)
    ))