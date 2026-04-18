import json
class ClassSchedule:
    def __init__(self,class_schedDB):
        self.class_schedDB = class_schedDB

    def createClass(self, section):
        #checks if the section already exists if it exists terminate the creation of class
        if self.class_schedDB.findOne("section", section): return f"Class creation failed: Class {section} already exists!"
        # if it does not exist create the class
        classSchedModel = {
            "section": section,
            "subjects": []
        }
        self.class_schedDB.addData(classSchedModel)
        return f"Class {section} successfully created!"



    def addShed(self, section, subject,day, start, end):
        data = self.class_schedDB.load()
        sectionExists = [sect for sect in data if sect["section"] == section][0]
        if sectionExists is None: return f"Class {section} does not exists"
        # checks if subject exists, if it exists terminate
        subjectExists = [subjects["subject"] for subjects in sectionExists["subjects"]]
        if subject not in subjectExists: return f"Subject {subject} does not exists"

        for subjects in sectionExists["subjects"]:
            if subjects["subject"] == subject:
                subjects["schedule"].append({
                    "day": day,
                    "start": start,
                    "end": end
                })
                return self.class_schedDB.saveData(data)



    def addSubjects(self, section: str, schedule_model: object):
        data = self.class_schedDB.load()
        sectionExists = [sect for sect in data if sect["section"] == section][0]
        print(sectionExists)
        # check if the section exists, if it does not, terminate
        if sectionExists is None: return f"Class {section} does not exists"

        # checks if subject exists, if it exists terminate
        for subject in sectionExists["subjects"]:
            if subject["subject"] == schedule_model["subject"]:
                return f"Subject {schedule_model["subject"]} already exists"



        sectionExists["subjects"].append(schedule_model)
        self.class_schedDB.saveData(data)
        return "Successfully added a subject"




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
        return formattedSubject

    def getSubjects(self,section):
        section = self.class_schedDB.findOne("section", section)
        if section is None: return f"Section {section} does not exists"
        for assignment in section["subjects"]:
            assignment.pop("assignments")
        return section["subjects"]
