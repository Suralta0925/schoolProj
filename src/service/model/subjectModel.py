def SubjectModel(day, start, end, subject, room, instructor):
    model = {
        "schedule": [{"day": day, "start": start, "end": end}],
        "subject": subject,
        "room": room,
        "instructor": instructor,
        "assignments": []
    }
    return model