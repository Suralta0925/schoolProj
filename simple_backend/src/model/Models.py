from pydantic import BaseModel

class CreateAssignment(BaseModel):
    description: str
    deadline: str

class CreateClass(BaseModel):
    section: str
    year: str
    program: str

class Schedule(BaseModel):
    day: str
    start: str
    end: str

class SubjectModel(BaseModel):
    id: int
    subject: str
    teacher: str
    room: str
    day: str
    startTime: str
    endTime: str

class UserModelRegister(BaseModel):
    username: str
    email: str
    password: str

class UserModelLogin(BaseModel):
    username: str
    password: str

class JoinRequest(BaseModel):
    class_code: str

