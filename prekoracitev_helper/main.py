from logic import process_file
import os
from fastapi import FastAPI, UploadFile, File
from fastapi.responses import JSONResponse
import shutil

HOST = "0.0.0.0"
PORT = 54321
app = FastAPI()

@app.get("/")
async def root():
    return {"status": "running"}

@app.post("/upload-file-dogovorjena-moc")
async def upload_file(file: UploadFile = File(...)):
    filename = file.filename
    save_path = f"./{filename}"

    with open(save_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        result = process_file(save_path)
    finally:
        try:
            os.remove(save_path)
            print(f"Deleted file: {save_path}")
        except Exception as e:
            print(f"Error deleting file: {e}")

    return JSONResponse(result)
    

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host=HOST, port=PORT, reload=True)