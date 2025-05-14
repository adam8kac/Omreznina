from parser import filter_files

from fastapi import FastAPI

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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host=HOST, port=PORT, reload=True)
    print(f"App running on: {HOST}:{PORT}")

