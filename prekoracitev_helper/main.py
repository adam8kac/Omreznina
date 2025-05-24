from logic import process_file
import os
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.responses import JSONResponse
import shutil
import json

HOST = "0.0.0.0"
PORT = 54321
app = FastAPI()

@app.get("/")
async def root():
    return {"status": "running"}

@app.post("/upload-file-dogovorjena-moc")
async def upload_file(
    file: UploadFile = File(...),
    power_by_months: str = Form(...)
):
    filename = file.filename
    save_path = f"./{filename}"

    with open(save_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        agreed_power_map = json.loads(power_by_months)
        result = process_file(save_path, agreed_power_map)
    finally:
        os.remove(save_path)

    return JSONResponse(result)
    

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host=HOST, port=PORT, reload=True)