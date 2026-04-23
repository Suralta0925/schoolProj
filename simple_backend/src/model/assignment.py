from pydantic import BaseModel

class CreateAssignment(BaseModel):
    description: str
    deadline: str

class CreateClass(BaseModel):
    section: str

class Schedule(BaseModel):
    day: str
    start: str
    end: str

class SubModel(BaseModel):
    schedule: list[Schedule]
    subject: str
    room: str
    instructor: str

class UserModelRegister(BaseModel):
    username: str
    email: str
    password: str

class UserModelLogin(BaseModel):
    username: str
    password: str
