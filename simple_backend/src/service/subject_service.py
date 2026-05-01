from .model import Res
res = Res()
class Subject:

    def __init__(self, subject_database):
        self.subjects = subject_database

    #FORTMAT
    #{SECTION: {DATE: [{id,subject, room, startTime, endTime}]}}
    async def addSchedule(self, section,day, _id, subject, room, startTime, endTime):
        subjectData = self.subjects.load()
        model = {
            "id": _id,
            "subject": subject,
            "room": room,
            "day": day,
            "startTime": startTime,
            "endTime": endTime
        }
        if section not in subjectData:
            subjectData[section] = {}

        if day not in subjectData[section]:
            subjectData[section][day] = []

        if subject in [subjects["subject"] for subjects in subjectData[section][day]]:
            return res.status(409).json({"message": "Subject already exists!"})

        subjectData[section][day].append(model)
        self.subjects.saveData(subjectData)
        return res.status(200).json({"message": "Successfully added a subject!"})

    async def getSchedule(self, section):
        scheduleData = await self.subjects.load()
        classSection = scheduleData[section]
        if not classSection:
            return res.status(404).json({"message": "Section does not exists!"})
        return classSection
