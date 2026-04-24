import secrets
import string

from .model import Res
from .model import Validation as v
res = Res()

def generate_code():
    chars = string.ascii_uppercase + string.digits
    code = ''.join(secrets.choice(chars) for _ in range(6))
    return f"{code[:3]}-{code[3:]}"

class ClassSchedule:
    def __init__(self,class_schedDB):
        self.class_schedDB = class_schedDB
        self.v = v(class_schedDB)



    #Class Create, Read, Update, Delete operation

    async def createClass(self, user_uuid, section,year, program):
        #checks if the section already exists if it exists terminate the creation of class
        if  await self.v.sectionExists(section): return None
        # if it does not exist create the class
        classSchedModel = {
            "admin": user_uuid,
            "class_code": generate_code(),
            "section": section,
            "year": year,
            "program": program,
            "subjects": []
        }
        await self.class_schedDB.addData(classSchedModel)
        return {
            "status": 200,
            "message": "Class created successfully!",
            "classCode": classSchedModel["class_code"]
        }


    def updateClass(self, section, updated_section):
        if not self.v.sectionExists(section): res.status(404).json({"message": "Section not found!"})
        data = self.class_schedDB.load()
        for newData in data:
            if newData["section"] == section:
                newData["section"] = updated_section
        self.class_schedDB.saveData(data)
        return res.json(data)

    def deleteClass(self, section):
        if not self.v.sectionExists(section): res.status(404).json({"message": "Section not found!"})
        data = self.class_schedDB.load()
        updatedData = [newData for newData in data if newData["section"] != section]
        self.class_schedDB.saveData(data)
        return res.json({"message": f"Successfully deleted class {section}"})

    #Subject Create, Read, Update, Delete

    def addSubjects(self, section: str, schedule_model: object):
        if not self.v.sectionExists(section): return res.status(404).json({"message": f"Subject creation failed: Section does not exists"})
        data = self.class_schedDB.load()
        classes = [_class for _class in data if _class["section"]==section][0]
        # checks if subject exists, if it exists terminate
        for subject in classes["subjects"]:
            if subject["subject"] == schedule_model["subject"]:
                return res.status(409).json({"message": "Subject already exists!"})




        classes["subjects"].append(schedule_model)
        self.class_schedDB.saveData(data)
        return res.json({"message": f"Successfully added the subject {schedule_model["subject"]}"})

    def getSubjects(self,section):
        section = self.class_schedDB.findOne("section", section)
        if section is None: return res.status(404).json({"message": f"Section does not exists"})
        for assignment in section["subjects"]:
            assignment.pop("assignments", None)
        return section["subjects"]



    def addShed(self, section, subject,day, start, end):
        data = self.class_schedDB.load()
        sectionExists = [sect for sect in data if sect["section"] == section][0]
        if sectionExists is None: return res.status(404).json({"message": f"Class {section} does not exists"})
        # checks if subject exists, if it exists terminate
        subjectExists = [subjects["subject"] for subjects in sectionExists["subjects"]]

        if subject not in subjectExists: return res.status(404).json({"message": f"Subject {subject} does not exists"})

        for subjects in sectionExists["subjects"]:
            if subjects["subject"] == subject:
                subjects["schedule"].append({
                    "day": day,
                    "start": start,
                    "end": end
                })
            self.class_schedDB.saveData(data)
            return res.status(200).json({"message": "Successfully added schedule!"})








    def addAssignment(self, section:str, _subject:str, assignment_model: object) -> str:
        data = self.class_schedDB.load()
        sectionInfo = [sect for sect in data if sect["section"] == section][0]
        if assignment_model["description"] in self.getAssignments(section, _subject): return "Assignment already exists!"
        for subject in sectionInfo["subjects"]:

            if subject["subject"] == _subject:
                if subject["assignments"] in self.getAssignments(section,_subject):
                    return "Assignment already exists!"
                subject["assignments"].append(assignment_model)
                self.class_schedDB.saveData(data)
                return "Successfully added an assignment!"
        return "Something went wrong!"

    def getAssignments(self,section: str, subject: str) -> list[object]:
        sectionInfo = self.class_schedDB.findOne("section", section)
        for subjects in sectionInfo["subjects"]:
            print("this",subjects["assignments"])
            print(subject)
            if subjects["subject"] == subject:
                return [assignments["description"] for assignments in subjects["assignments"]]
        return []

    def getFormattedAssignments(self, section: str) -> object:
        if not self.v.sectionExists(section): return res.status(404).json({"message": f"Class {section} does not exists"})
        sectionInfo = self.class_schedDB.findOne("section", section)
        formattedSubject = []
        for subject in sectionInfo["subjects"]:
            for assignment in subject["assignments"]:
                formattedSubject.append({
                    "status": "finished",
                    "subject": subject["subject"],
                    "assignment": assignment["description"],
                    "deadline": assignment["deadline"]
                })
        return res.status(200).json(formattedSubject)


