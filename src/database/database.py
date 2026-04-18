import json

class Database:
        def __init__(self, __directory):
            self.__directory = __directory

        # Read Data
        def load(self):
            try:
                with open(self.__directory, "r") as infoFile:
                    data = json.load(infoFile)
                    if not data:
                        data = []
                    return data
            except (FileNotFoundError, json.JSONDecodeError):
                return []

        # appends new data to the current data
        def addData(self, model):
            data = self.load()
            data.append(model)
            with open(self.__directory, "w") as infoFile:
                json.dump(data, infoFile, indent=4)
            return self.load()

        # overwrites the current data
        def saveData(self, data):
            with open(self.__directory, "w") as infoFile:
                return json.dump(data,infoFile, indent=4)


        #Update Data
        def updateData(self, key, new_value):
            data = self.load()
            for info in data:
                info[key] = new_value
            print(data)
            self.saveData(data)

        #Delete Data
        def deleteData(self, key, value):
            data = self.load()
            newData = [info for info in data if info[key] != value]
            self.saveData(newData)


        def findAll(self):
            return self.load()

        def findBy(self, key, value):
            data = self.load()
            return [items for items in data if items.get[key] == value]

        def findOne(self, key, value, data=None):
            if data is None: data = self.load()
            for items in data:
                if items.get(key) == value:
                    return items
            return None