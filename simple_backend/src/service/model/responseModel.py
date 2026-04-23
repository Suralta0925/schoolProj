from fastapi.responses import JSONResponse

class Res:
    def __init__(self):
        self._status = 200

    def status(self, code: int):
        self._status = code
        return self

    def json(self, content: dict):
        return JSONResponse(
            status_code=self._status,
            content= content
        )