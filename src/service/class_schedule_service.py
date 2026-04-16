import os
class ClassSchedule:
    def __init__(self,class_schedDB):
        self.class_schedDB = class_schedDB

    def createClass(self, section):
        classSchedModel = {
            "section": section,
            "subjects": []

        }
        print(self.class_schedDB.addData(classSchedModel))
    def addSubjects(self, section, schedule_model):
        data = self.class_schedDB.findOne("section", section)
        if data:
            data["subjects"].append(schedule_model)
            self.class_schedDB.updateData("subjects",data["subjects"])
            return "Successfully added a subject"
        return f"Class {section} does not exists"





