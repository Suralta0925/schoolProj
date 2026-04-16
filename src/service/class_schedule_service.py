import os
class ClassSchedule:
    def __init__(self,class_schedDB):
        self.class_schedDB = class_schedDB

    def createClass(self, section, day, start, end, subject, room, instructor):
        classSchedModel = {
            "section": section,
            "schedule": [{"day": day, "start": start, "end": end}],
            "subject": subject,
            "room": room,
            "instructor": instructor
        }
        print(self.class_schedDB.save(classSchedModel))




