import json

class Database:
        def __init__(self, __directory):
            self.__directory = __directory

        def load(self):
            try:
                with open(self.__directory, "r") as infoFile:
                    data = json.load(infoFile)
                    if not data:
                        data = []
                    return data
            except (FileNotFoundError, json.JSONDecodeError):
                return []
        def save(self, model):
            data = self.load()
            data.append(model)
            with open(self.__directory, "w") as infoFile:
                json.dump(data, infoFile, indent=4)
            return self.load()

        def findAll(self):
            return self.load()

        def findBy(self, key, value):
            data = self.load()
            return [items for items in data if items.get[key] == value]

        def findOne(self, key, value):
            data = self.load()
            for items in data:
                if items.get(key) == value:
                    return items
            return None