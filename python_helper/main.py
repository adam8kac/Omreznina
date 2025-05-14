from parser import filter_files

from fastapi import FastAPI

HOST = "127.0.0.1"
PORT = 12345
app = FastAPI()

@app.get("/file-to-json")
async def hello_endpoint():
    result = filter_files()
    return result

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host=HOST, port=PORT, reload=True)
    print(f"App running on: {HOST}:{PORT}")

