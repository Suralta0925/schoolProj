import os
import uuid

from src.database import Database
class UserService:
    path = os.path.join(os.path.dirname(__file__), "../data/user.json")
    db = Database(path)
    def create(self, username, password, section, role):
        if self.db.findOne("username", username) is None:
            userModel = {
                "_id": str(uuid.uuid4()),
                "username": username,
                "password": password,
                "section": section,
                "role": role
            }
            self.db.save(userModel)
            print({"message": "User successfully created!"})
        print({"message": "User already exists!"})


