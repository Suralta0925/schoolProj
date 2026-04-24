import os
import asyncio

from database import Database
from service import UserService, ClassSchedule, SubjectModel, AssignmentModel

userPath = os.path.join(os.path.dirname(__file__), "data/user.json")
schedPath = os.path.join(os.path.dirname(__file__), "./data/class_schedule.json")

userDB = Database(userPath)
schedDB = Database(schedPath)


# user = UserService(userDB, schedDB)
# schedule = ClassSchedule(schedDB)

#async def printLen():
import json
from collections import defaultdict

  # change if needed


def find_duplicates():
    with open(userPath, "r") as f:
        data = json.load(f)

    counter = defaultdict(int)
    duplicates = {}

    # count usernames
    for user in data:
        username = user.get("username")
        counter[username] += 1

    # collect duplicates
    for user in data:
        username = user.get("username")
        if counter[username] > 1:
            if username not in duplicates:
                duplicates[username] = []
            duplicates[username].append(user)

    # output results
    if not duplicates:
        print("✅ No duplicate usernames found.")
    else:
        print("❌ Duplicates detected:\n")
        for username, users in duplicates.items():
            print(f"Username: {username} (count: {len(users)})")
            for u in users:
                print(f"  -> {u}")
            print()


if __name__ == "__main__":
    find_duplicates()



























# subjectModel = SubjectModel("Monday","5","7","Accounting Principle","Comlab1","Aina")
# print(schedule.addSubjects("AI11", subjectModel))



# while True:
#     print("Select:\n\n1. Create Class\n2. Add subject\n3. Add assignments\n4.Add Schedule")
#     option = int(input("Enter: "))
#     section = input("Enter the section: ")
#     match option:
#         case 1:
#             print(schedule.createClass(section))
#         case 2:
#             day = input("Enter the day of subject schedule: ")
#             start = input("Enter the time start of the subject: ")
#             end = input("Enter the time end of the subject: ")
#             subjectName = input("Subject Title: ")
#             room = input("Enter room location of the subject: ")
#             instructor = input("Enter subject Instructor: ")
#             subjectModel = SubjectModel(day,start,end,subjectName,room,instructor)
#             print(schedule.addSubjects(section, subjectModel))
#         case 3:
#             subject = input("Enter subjects: ")
#             description = input("Assignment Title: ")
#             deadline = input("Assignment Deadline: ")
#             assigmentModel = AssignmentModel(description, deadline)
#             schedule.addAssignment(section, subject,assigmentModel)
#         case 4:
#             subject = input("Enter subjects: ")
#             day = input("Enter the day of subject schedule: ")
#             start = input("Enter the time start of the subject: ")
#             end = input("Enter the time end of the subject: ")
#             schedule.addShed(section,subject, day, start, end)