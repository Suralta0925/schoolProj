import uuid
class UserService:
    def __init__(self, userDB, class_schedDB):
        self.userDB = userDB
        self.class_schedDB = class_schedDB
    def create(self, username, password, section, role):
        if self.userDB.findOne("username", username) is None:
            userModel = {
                "_id": str(uuid.uuid4()),
                "username": username,
                "password": password,
                "section": section,
                "role": role
            }
            self.userDB.addData(userModel)
            print({"message": "User successfully created!"})
        print({"message": "User already exists!"})


