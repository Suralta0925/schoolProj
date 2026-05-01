import { classRoute } from "../config/config"
import type { AdminSchedule } from "../pages/HomePage/dashboard"
import {type ClassProfile } from "../pages/HomePage/settings"

async function leaveClass(){
    try{
          const res = await fetch(`${classRoute}/leave`,{
            method: "POST",
            credentials: "include"
          })
          const data = await res.json()
          return data
        }
    catch(err: unknown){
        console.log(err)
        return null
    }
}

async function getClassInfo(): Promise<ClassProfile>{
    try{
        const res = await fetch(`${classRoute}/getClassInfo`,{
            method: "POST",
            credentials: "include"
        })
        const data = await res.json()
        return data
    }catch(err: unknown){
        console.log(err)
        return null
    }
}

async function addSched(s: AdminSchedule){
    try{
        const res = await fetch(`${classRoute}/addSchedule`,{
            method: "POST",
            credentials: "include",
            body: JSON.stringify(s)
        })
        if (!res) return
        const data = await res.json()
        return data
    }catch(err){
        console.log(err)
    }
}

export {getClassInfo,leaveClass, addSched}