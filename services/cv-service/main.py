from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from detector.preprocess import preprocess_image, extract_face_grid
from detector.color_detect import detect_face_colors
from detector.state_builder import validate_cube_state, build_cube_string, validate_orientation
import httpx
import uvicorn
import cv2
import numpy as np

app = FastAPI(title="Rubix CV Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

SOLVER_URL = "http://localhost:8080/solve"
FACE_ORDER = ["TOP", "LEFT", "FRONT", "RIGHT", "BACK", "BOTTOM"]


@app.get("/")
def root():
    return {"status": "CV service running"}


@app.post("/detect")
async def detect_colors(
    top:    UploadFile = File(...),
    left:   UploadFile = File(...),
    front:  UploadFile = File(...),
    right:  UploadFile = File(...),
    back:   UploadFile = File(...),
    bottom: UploadFile = File(...),
):
    uploaded = {
        "TOP":    await top.read(),
        "LEFT":   await left.read(),
        "FRONT":  await front.read(),
        "RIGHT":  await right.read(),
        "BACK":   await back.read(),
        "BOTTOM": await bottom.read(),
    }

    faces = {}
    for face_name, image_bytes in uploaded.items():
        img    = preprocess_image(image_bytes)
        cells  = extract_face_grid(img)
        colors = detect_face_colors(cells)
        faces[face_name] = colors

    if not validate_cube_state(faces):
        raise HTTPException(
            status_code=400,
            detail="Invalid cube state — each color must appear exactly 9 times. Please rescan."
        )

    is_valid_orientation, orientation_error = validate_orientation(faces)
    if not is_valid_orientation:
        raise HTTPException(status_code=400, detail=orientation_error)

    cube_string = build_cube_string(faces)

    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.get(
            SOLVER_URL,
            params={"state": cube_string}
        )
        solver_result = response.json()

    if solver_result.get("status") != "ok":
        raise HTTPException(
            status_code=500,
            detail=solver_result.get("error", "Solver failed")
        )

    return {
        "status":     "ok",
        "cube_state": cube_string,
        "solution":   solver_result["solution"],
        "moves":      solver_result["moves"],
        "faces":      faces,
    }


@app.post("/debug")
async def debug_colors(
    top:    UploadFile = File(...),
    left:   UploadFile = File(...),
    front:  UploadFile = File(...),
    right:  UploadFile = File(...),
    back:   UploadFile = File(...),
    bottom: UploadFile = File(...),
):
    uploaded = {
        "TOP":    await top.read(),
        "LEFT":   await left.read(),
        "FRONT":  await front.read(),
        "RIGHT":  await right.read(),
        "BACK":   await back.read(),
        "BOTTOM": await bottom.read(),
    }

    color_names = {
        0: "white", 1: "orange", 2: "green",
        3: "red",   4: "blue",   5: "yellow"
    }

    faces = {}
    faces_raw = {}

    for face_name, image_bytes in uploaded.items():
        img    = preprocess_image(image_bytes)
        cells  = extract_face_grid(img)
        colors = detect_face_colors(cells)
        faces_raw[face_name] = colors
        faces[face_name] = {
            "raw":    colors,
            "named":  [color_names[c] for c in colors],
            "counts": {color_names[i]: colors.count(i) for i in range(6)}
        }

    all_colors = []
    for face_data in faces.values():
        all_colors.extend(face_data["raw"])

    total_counts  = {color_names[i]: all_colors.count(i) for i in range(6)}
    cube_string   = build_cube_string(faces_raw)

    solver_response = None
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(
                SOLVER_URL,
                params={"state": cube_string}
            )
            solver_response = response.json()
    except Exception as e:
        solver_response = {"error": str(e)}

    return {
        "faces":           faces,
        "total_counts":    total_counts,
        "total_stickers":  len(all_colors),
        "valid":           all(v == 9 for v in total_counts.values()),
        "cube_string":     cube_string,
        "solver_response": solver_response
    }


@app.get("/validate/{cube_string}")
def validate_state(cube_string: str):
    color_names = {
        "0": "white", "1": "orange", "2": "green",
        "3": "red",   "4": "blue",   "5": "yellow"
    }

    if len(cube_string) != 54:
        return {
            "valid": False,
            "error": f"Length is {len(cube_string)}, must be 54"
        }

    counts = {}
    for char in cube_string:
        name = color_names.get(char, "unknown")
        counts[name] = counts.get(name, 0) + 1

    all_nine = all(v == 9 for v in counts.values())

    return {
        "valid":       all_nine,
        "counts":      counts,
        "cube_string": cube_string,
        "length":      len(cube_string)
    }


@app.post("/diagnose")
async def diagnose(
    top:    UploadFile = File(...),
    left:   UploadFile = File(...),
    front:  UploadFile = File(...),
    right:  UploadFile = File(...),
    back:   UploadFile = File(...),
    bottom: UploadFile = File(...),
):
    """
    Shows exact HSV values for every cell so we can tune color ranges
    """
    uploaded = {
        "TOP":    await top.read(),
        "LEFT":   await left.read(),
        "FRONT":  await front.read(),
        "RIGHT":  await right.read(),
        "BACK":   await back.read(),
        "BOTTOM": await bottom.read(),
    }

    result = {}

    for face_name, image_bytes in uploaded.items():
        img   = preprocess_image(image_bytes)
        cells = extract_face_grid(img)
        face_data = []

        for i, cell in enumerate(cells):
            h_img, w_img = cell.shape[:2]
            margin_h = h_img // 5
            margin_w = w_img // 5
            center = cell[margin_h:h_img-margin_h, margin_w:w_img-margin_w]
            hsv    = cv2.cvtColor(center, cv2.COLOR_BGR2HSV)
            avg    = cv2.mean(hsv)

            face_data.append({
                "cell": i,
                "H":    round(avg[0], 1),
                "S":    round(avg[1], 1),
                "V":    round(avg[2], 1),
            })

        result[face_name] = face_data

    return result


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)