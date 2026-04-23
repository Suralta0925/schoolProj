import json
import asyncio

class Database:
        def __init__(self, __directory):
            self.__directory = __directory
            self.lock = asyncio.Lock()

        # Read Data
        async def load(self):
            try:
                with open(self.__directory, "r") as infoFile:
                    data = json.load(infoFile)
                    if not data:
                        data = []
                    return data
            except (FileNotFoundError, json.JSONDecodeError):
                return []

        # appends new data to the current data
        async def addData(self, model):
            async with self.lock:
                data = await self.load()
                data.append(model)
                with open(self.__directory, "w") as infoFile:
                    json.dump(data, infoFile, indent=4)


        # overwrites the current data
        def saveData(self, data):
            with open(self.__directory, "w") as infoFile:
                return json.dump(data,infoFile, indent=4)


        #Update Data
        async def updateData(self, key, new_value):
            data = await self.load()
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

        async def findOne(self, key, value, data=None):
            if data is None: data = await self.load()
            if data is None: return None
            for items in data:
                if items.get(key) == value:
                    return items
            return None