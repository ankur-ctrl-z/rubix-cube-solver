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


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)