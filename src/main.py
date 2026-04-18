import os


from database import Database
from service import UserService, ClassSchedule, SubjectModel, AssignmentModel

userPath = os.path.join(os.path.dirname(__file__), "./data/user.json")
schedPath = os.path.join(os.path.dirname(__file__), "./data/class_schedule.json")

userDB = Database(userPath)
schedDB = Database(schedPath)


user = UserService(userDB, schedDB)
schedule = ClassSchedule(schedDB)

print(schedule.getSubjects("AI12"))



























# subjectModel = SubjectModel("Monday","5","7","Accounting Principle","Comlab1","Aina")
# print(schedule.addSubjects("AI11", subjectModel))



while True:
    print("Select:\n\n1. Create Class\n2. Add subject\n3. Add assignments\n4.Add Schedule")
    option = int(input("Enter: "))
    section = input("Enter the section: ")
    match option:
        case 1:
            print(schedule.createClass(section))
        case 2:
            day = input("Enter the day of subject schedule: ")
            start = input("Enter the time start of the subject: ")
            end = input("Enter the time end of the subject: ")
            subjectName = input("Subject Title: ")
            room = input("Enter room location of the subject: ")
            instructor = input("Enter subject Instructor: ")
            subjectModel = SubjectModel(day,start,end,subjectName,room,instructor)
            print(schedule.addSubjects(section, subjectModel))
        case 3:
            subject = input("Enter subjects: ")
            description = input("Assignment Title: ")
            deadline = input("Assignment Deadline: ")
            assigmentModel = AssignmentModel(description, deadline)
            schedule.addAssignment(section, subject,assigmentModel)
        case 4:
            subject = input("Enter subjects: ")
            day = input("Enter the day of subject schedule: ")
            start = input("Enter the time start of the subject: ")
            end = input("Enter the time end of the subject: ")
            schedule.addShed(section,subject, day, start, end)