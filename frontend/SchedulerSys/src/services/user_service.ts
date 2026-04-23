import { api } from "../config/config";

type UserRegister = {
    username: string,
    email: string,
    password: string
}

type UserLogin ={
    username: string,
    password: string
}
type ApiResponse<T> = {
  status: number;
  message: string;
  data?: T;
};

async function register(user : UserRegister): Promise<ApiResponse<UserRegister>>{
    try{
        const res: Response = await fetch(`${api}/register`, {
            method: 'POST',
            headers:{
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(user)
        })
        const data = await res.json()
        if (!res.ok){
            return {
                status: res.status,
                message: data.message,
                data: data.user
            };
        }
        return {status: res.status,message: data.message,data: data}
        
    }catch(err: unknown){
        console.log(err)
        return {
            status:500,
            message: "Network Error"
        }
    }
}

async function login(user : UserLogin): Promise<ApiResponse<UserLogin>>{
    try{
        const res: Response = await fetch(`${api}/login`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify(user)
        })
        const data = await res.json()
        if (!res.ok){
            return {
                status: res.status,
                message: data.message,
                data: data.user
            }
        }
        return {
                status: res.status,
                message: data.message,
                data: data.user
            }
    }catch(err : unknown){
        console.log(err)
        return {
                status: 500,
                message: "Network Error"
        }
    }
}

async function logout(){
    try{
        const res: Response = await fetch(`${api}/logout`,{
            method:"POST",
            credentials:"include"
        })
        const data = await res.json()
        console.log(data)
        return data
    }catch(err: unknown){
        console.log(err)
        return null
    }
}



export {register, login, logout}