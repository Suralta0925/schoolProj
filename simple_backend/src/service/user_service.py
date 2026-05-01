import secrets
import uuid

import jwt

from .model import Res
res = Res()






class UserService:
    def __init__(self, userDB, class_schedDB):
        self.userDB = userDB
        self.class_schedDB = class_schedDB


    async def create(self, username, email, password):
        if await self.userDB.findOne("username", username) is None or await self.userDB.findOne("email", email) is None:
            userModel = {
                "_id": str(uuid.uuid4()),
                "username": username,
                "email": email,
                "password": password,
                "section": ""
            }
            await self.userDB.addData(userModel)
            return res.status(200).json({"message": "User successfully created!"})
        return res.status(409).json({"message": "User already exists!"})

    async def setSection(self, user_id, section):
        users = await self.userDB.load()
        for user in users:
            print(user["_id"], user_id)
            if user["_id"] == user_id:
                user["section"] = section
                await self.userDB.saveData(users)
                return "Success"
        return None