

from fastapi import APIRouter, Depends
import os

from ..model.assignment import JoinRequest
from ..service.model import Res
from ..database import Database
from ..service import UserService, ClassSchedule, SubjectModel, AssignmentModel
from ..model import *
from .user_router import authorize

userPath = os.path.join(os.path.dirname(__file__), "../data/user.json")
schedPath = os.path.join(os.path.dirname(__file__), "../data/class_schedule.json")

userDB = Database(userPath)
schedDB = Database(schedPath)


res = Res()

user = UserService(userDB, schedDB)
schedule = ClassSchedule(schedDB)

router = APIRouter()






#Class http methods
@router.post("/create")
async def createClass(class_model: CreateClass ,user_authorization: dict = Depends(authorize)):
    result = await schedule.createClass(user_authorization["id"], class_model.section, class_model.year, class_model.program)
    if result:
        await user.setSection(user_authorization["id"], class_model.section)
        return result
    return res.status(409).json({"message": f"Class creation failed: Class {class_model.section} already exists!"})

@router.post("/join")
async def joinClass(data: JoinRequest, user_authorization: dict = Depends(authorize)):
    result = await schedDB.findOne("class_code", data.class_code)
    print("this works???")
    if result:
        await user.setSection(user_authorization["id"], result["section"])
        return {"status": 200, "message": "Successfully joined a class"}
    return res.status(400).json({"message": "Please enter a valid class code"})






#Subject http methods

@router.post("/addSubject")
def createSubject(section: str,model: SubModel):
    return schedule.addSubjects(section, model.model_dump())

@router.get("/assignments")
def getAssignments(section: str):
    return schedule.getFormattedAssignments(section)

@router.post("/assignments")
def createAssignments(section:str, subject: str, model: CreateAssignment):
    print(section, subject)
    return schedule.addAssignment(section, subject, AssignmentModel(model.description,model.deadline))

@router.get("/subjects")
def getSubjects(section: str):
    return schedule.getSubjects(section)