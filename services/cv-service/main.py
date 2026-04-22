from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from detector.preprocess import preprocess_image, extract_face_grid
from detector.color_detect import detect_face_colors
from detector.state_builder import validate_cube_state, build_cube_string
import httpx
import uvicorn

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
    """
    Accept 6 face images, detect colors, build cube state,
    call Java solver, return solution
    """
    uploaded = {
        "TOP":    await top.read(),
        "LEFT":   await left.read(),
        "FRONT":  await front.read(),
        "RIGHT":  await right.read(),
        "BACK":   await back.read(),
        "BOTTOM": await bottom.read(),
    }

    # Process each face
    faces = {}
    for face_name, image_bytes in uploaded.items():
        img     = preprocess_image(image_bytes)
        cells   = extract_face_grid(img)
        colors  = detect_face_colors(cells)
        faces[face_name] = colors

    # Validate state
    if not validate_cube_state(faces):
        raise HTTPException(
            status_code=400,
            detail="Invalid cube state — each color must appear exactly 9 times. Please rescan."
        )

    # Build cube string for Java solver
    cube_string = build_cube_string(faces)

    # Call Java solver
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
            "raw": colors,
            "named": [color_names[c] for c in colors],
            "counts": {color_names[i]: colors.count(i) for i in range(6)}
        }

    all_colors = []
    for face_data in faces.values():
        all_colors.extend(face_data["raw"])

    total_counts = {color_names[i]: all_colors.count(i) for i in range(6)}
    cube_string  = build_cube_string(faces_raw)

    # directly call java solver so we can see its response
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
        "faces":         faces,
        "total_counts":  total_counts,
        "total_stickers": len(all_colors),
        "valid":         all(v == 9 for v in total_counts.values()),
        "cube_string":   cube_string,
        "solver_response": solver_response
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)