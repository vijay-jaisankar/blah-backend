from fastapi import FastAPI

app = FastAPI()

"""
    Base route to check if the API is up
    Can be used as a prophylaxis by any services using this api
"""
@app.get("/status")
def get_status():
    return {"status": "up ✓"}


