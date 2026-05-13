import { classRoute } from "../config/config"
import type { AdminScheduleEntry } from "../pages/HomePage/dashboard"
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

async function addSched(s: AdminScheduleEntry){
    try{
        const res = await fetch(`${classRoute}/Schedule`,{
            method: "POST",
            credentials: "include",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                "id": s.id,
                "subject": s.subject,
                "teacher": s.teacher,
                "room": s.room,
                "day": s.day,
                "startTime": s.startTime,
                "endTime": s.endTime
            })
        })
        if (!res.ok) return
        const data = await res.json()
        return data
    }catch(err){
        console.log(err)
    }
}

async function getSched(){
    try{
        const res = await fetch(`${classRoute}/Schedule`,{
            method: "GET",
            credentials: "include"
        })
        if (!res.ok) return
        const data = await res.json()
        return data
    }catch(err){
        console.log(err)
    }
}

async function delSched(id: number, day: string){
    try{
        const res = await fetch(`${classRoute}/Schedule`, {
            method: "DELETE",
            credentials: "include",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                "id": id,
                "day": day
            })
        })
        if (!res.ok) return
        const data = await res.json()
        return data
    }catch(err){
        console.log(err)
    }
}

async function editSched(s: AdminScheduleEntry){
    try{
        const res = await fetch(`${classRoute}/Schedule`,{
            method: "PUT",
            credentials: "include",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                "id": s.id,
                "subject": s.subject,
                "teacher": s.teacher,
                "room": s.room,
                "day": s.day,
                "startTime": s.startTime,
                "endTime": s.endTime
            })
        })
        if (!res.ok) return
        const data = await res.json()
        return data
    }catch(err){
        console.log(err)
    }
}

export {getClassInfo,leaveClass, addSched, getSched, delSched, editSched}