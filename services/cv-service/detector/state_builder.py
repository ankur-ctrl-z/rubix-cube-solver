def validate_cube_state(faces: dict) -> bool:
    """
    Check that all 6 colors appear exactly 9 times
    faces: { "TOP": [9 ints], "LEFT": [...], ... }
    """
    all_colors = []
    for face_colors in faces.values():
        all_colors.extend(face_colors)
    
    if len(all_colors) != 54:
        return False
    
    # Each color 0-5 must appear exactly 9 times
    for color in range(6):
        if all_colors.count(color) != 9:
            return False
    
    return True


def build_cube_string(faces: dict) -> str:
    """
    Convert face color arrays into a 54-character string
    Order must match Java solver: TOP LEFT FRONT RIGHT BACK BOTTOM
    faces: { "TOP": [9 ints], "LEFT": [...], ... }
    """
    order = ["TOP", "LEFT", "FRONT", "RIGHT", "BACK", "BOTTOM"]
    
    cube_string = ""
    for face_name in order:
        for color_id in faces[face_name]:
            cube_string += str(color_id)
    
    return cube_string