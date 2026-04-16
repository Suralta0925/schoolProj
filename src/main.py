import os

from database import Database
from service import UserService, ClassSchedule

userPath = os.path.join(os.path.dirname(__file__), "./data/user.json")
schedPath = os.path.join(os.path.dirname(__file__), "./data/class_schedule.json")

userDB = Database(userPath)
schedDB = Database(schedPath)


user = UserService(userDB, schedDB)
schedule = ClassSchedule(schedDB)
schedDB.deleteData("section","AI12")
#schedule.createClass("AI11", "Monday", "7:30 AM", "9:00 AM","IntroComp", "Comlab6", "Turco")