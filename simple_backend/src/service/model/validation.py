
class Validation:

    def __init__(self, db):
        self.db = db


    def sectionExists(self,section: str):
        """
        Returns whether section exists or not
        """
        data = self.db.load()
        for classes in data:
            if section in classes["section"]:
                return True
        return False

    def validateSubject(self, section, subject):
        if not self.validatedSection(section): return False
        data = self.db.load()

        for classes in data:
            for subjects in classes["subjects"]:
                if subject in subjects["subject"]:
                    return True
        return False