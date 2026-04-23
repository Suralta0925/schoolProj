def SubjectModel(schedule, subject, room, instructor):
    model = {
        "schedule": schedule,
        "subject": subject,
        "room": room,
        "instructor": instructor,
        "assignments": []
    }
    return model