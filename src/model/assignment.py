from pydantic import BaseModel
class CreateAssignment(BaseModel):
    description: str
    deadline: str
