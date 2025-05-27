from parser import filter_files, read_files
import os
from fastapi import FastAPI, UploadFile, File
from fastapi.responses import JSONResponse
import shutil

HOST = "0.0.0.0"
PORT = 12345
app = FastAPI()

@app.get("/")
async def root():
    return {"status": "ok"}

@app.get("/file-to-json")
async def file_proceeser():
    result = filter_files()
    return result

@app.post("/upload-file")
async def upload_file(file: UploadFile = File(...)):
    filename = file.filename
    save_path = f"./{filename}"

    with open(save_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    filtered_files = {"csv": [], "xlsx": []}
    if filename.lower().endswith(".csv"):
        filtered_files["csv"].append(save_path)
    elif filename.lower().endswith(".xlsx"):
        filtered_files["xlsx"].append(save_path)
    else:
        return {"error": "Unsupported file type"}

    try:
        result = read_files(filtered_files)
    finally:
        try:
            os.remove(save_path)
            print(f"Deleted file: {save_path}")
        except Exception as e:
            print(f"Error deleting file: {e}")

    return JSONResponse(result)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=12345, reload=True)
