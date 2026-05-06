

from fastapi import APIRouter, Depends
import os

from ..model.Models import JoinRequest
from ..service.model import Res
from ..database import Database
from ..service import UserService, ClassSchedule, AssignmentModel
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
    result = await schedDB.findOne("classCode", data.class_code)
    if result:
        await user.setSection(user_authorization["id"], result["section"])
        await schedule.addCount(result["section"], 1)
        return {"status": 200, "message": "Successfully joined a class"}
    return res.status(400).json({"message": "Please enter a valid class code"})

@router.post("/leave")
async def leaveClass(user_auth : dict = Depends(authorize)):
    result = await user.setSection(user_auth["id"], "")
    if result:
        print(user_auth["section"])
        await schedule.addCount(user_auth["section"], -1)
        return {"status": 200, "message": "Successfully left the class!"}
    return res.status(409).json({"message": "Invalid user!!!"})

@router.post("/getClassInfo")
async def getInfo(classInfo: dict = Depends(authorize)):
    result = await schedule.getClassInfo(classInfo["section"])
    if result:
        return result
    return res.status(404).json({"message": "Unable to find section!"})







#Subject http methods
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