
import os



from .jwtsign import *
from fastapi import APIRouter, Response, Request, Header



from ..service import UserService
from ..database import Database
from ..model import UserModelRegister, UserModelLogin
from ..service.model import Res

res = Res()

schedPath = os.path.join(os.path.dirname(__file__), "../data/class_schedule.json")
schedDB = Database(schedPath)


userPath = os.path.join(os.path.dirname(__file__), "../data/userTest.json")
userDB = Database(userPath)
user_service = UserService(userDB, schedDB)

UserRouter = APIRouter()





@UserRouter.post("/register")
async def register(user : UserModelRegister):
    return await user_service.create(user.username, user.email, user.password)

@UserRouter.post("/login")
async def login(user: UserModelLogin, response: Response):
    if "@" in user.username:
        user_data = await userDB.findOne("email", user.username)
    else:
        user_data = await userDB.findOne("username",user.username)
    if not user_data: return res.status(401).json({"message": "Invalid Credentials"})
    if user_data["password"] != user.password:return res.status(401).json({"message": "Invalid Credentials"})

    token_data = {
        "sub": user_data["_id"],
        "username": user_data["username"],
        "email": user_data["email"]
    }

    access_token = sign(
        data=token_data,
        expires_delta= timedelta(hours=24)
    )

    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=False,
        samesite="lax",
        path="/",
        max_age=86400
    )
    return {
            "message": "Successfully logged in!",
            "user": {
                "id": user_data["_id"],
                "username": user_data["username"],
                "email": user_data["email"]
            }
        }

@UserRouter.post("/logout")
async def logout(response: Response):
    response.delete_cookie(
        key="access_token",
        path="/",
        secure=False,
        httponly=True,
        samesite="lax"
    )
    return {"message": "Successfully Logged out"}


@UserRouter.get("/authtest")
async def getInfo(request: Request, authorization: str = Header(None)):
    token = request.cookies.get("access_token")

    if not token and authorization:
        if authorization.startswith("Bearer "):
            token = authorization.replace("Bearer ", "")


    payload = decode(token)

    if not payload:
        return res.status(401).json({
            "message": "Invalid or expire"
        })
    user_id = payload.get("sub")
    user = await userDB.findOne("_id", user_id)

    if not user:
        return res.status(401).json({
            "message": "User not found"
        })

    return {
        "id": user["_id"],
        "username": user["username"],
        "email": user["email"],
        "section": user["section"]
    }



