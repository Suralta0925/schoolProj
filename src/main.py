from service import UserService, ClassSchedule

user = UserService()
schedule = ClassSchedule()
user.create("Vince","Suralta123","Ai11", "Student")
schedule.createClass("AI11", "Monday", "7:30 AM", "9:00 AM","IntroComp", "Comlab6", "Turco")