import os
from src.database import Database
class ClassSchedule:
    path = os.path.join(os.path.dirname(__file__), "../data/class_schedule.json")
    db = Database(path)

    def createClass(self, section, day, start, end, subject, room, instructor):
        classSchedModel = {
            "section": section,
            "schedule": [{"day": day, "start": start, "end": end}],
            "subject": subject,
            "room": room,
            "instructor": instructor
        }
        print(self.db.save(classSchedModel))




