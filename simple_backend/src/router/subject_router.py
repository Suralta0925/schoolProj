import json
import os

from fastapi import APIRouter, Depends

from .user_router import authorize
from src import Database
from ..service import Subject
from ..model import SubjectModel


subjectPath = os.path.join(os.path.dirname(__file__), "../data/subjects.json")
subjectDB = Database(subjectPath)
subjectService = Subject(subjectDB)

subjectRouter = APIRouter()

@subjectRouter.get("/getSchedule")
async def getSched(section: dict = Depends(authorize)):
    section = section["section"]
    data = await subjectService.getSchedule(section)
    return data


#Revise
#Format supposed to be [{ id, subject, teacher, slots:[{id,days,startTime,endTime,room}] }]
@subjectRouter.post("/addSchedule")
async def addSched(sched: SubjectModel, section: dict = Depends(authorize)):
    section = section["section"]
    data = await subjectService.addSchedule(
        section, sched.day, sched.id, sched.subject,sched.teacher, sched.room, sched.startTime, sched.endTime
    )
    return data

