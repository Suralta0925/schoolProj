from fastapi import APIRouter
import os

from database import Database
from service import UserService, ClassSchedule, SubjectModel, AssignmentModel
from model import CreateAssignment

userPath = os.path.join(os.path.dirname(__file__), "../data/user.json")
schedPath = os.path.join(os.path.dirname(__file__), "../data/class_schedule.json")

userDB = Database(userPath)
schedDB = Database(schedPath)




user = UserService(userDB, schedDB)
schedule = ClassSchedule(schedDB)

router = APIRouter()

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