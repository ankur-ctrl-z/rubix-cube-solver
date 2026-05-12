def validate_cube_state(faces: dict) -> bool:
    all_colors = []
    for face_colors in faces.values():
        all_colors.extend(face_colors)

    if len(all_colors) != 54:
        return False

    for color in range(6):
        if all_colors.count(color) != 9:
            return False

    centers = [faces[face][4] for face in faces]
    if len(set(centers)) != 6:
        return False

    return True


def validate_orientation(faces: dict) -> tuple:
    color_names = {
        0: "white", 1: "orange", 2: "green",
        3: "red",   4: "blue",   5: "yellow"
    }

    top_center   = faces["TOP"][4]
    front_center = faces["FRONT"][4]

    if top_center != 0:
        return False, f"TOP face center is {color_names[top_center]} but must be WHITE. Please hold cube with white face up."

    if front_center != 2:
        return False, f"FRONT face center is {color_names[front_center]} but must be GREEN. Please hold cube with green face toward camera."

    return True, "ok"


def build_cube_string(faces: dict) -> str:
    order = ["TOP", "LEFT", "FRONT", "RIGHT", "BACK", "BOTTOM"]
    cube_string = ""
    for face_name in order:
        for color_id in faces[face_name]:
            cube_string += str(color_id)
    return cube_string