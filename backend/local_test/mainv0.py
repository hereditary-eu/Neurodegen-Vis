from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI()

class Item(BaseModel):
  text: str = None
  is_done: bool = False

@app.get("/")
def home():
  return {"message": "Hello world, hello FastAPI"}

# items = ['orange', 'apple', 'banana']
items = []

# pass item as path parameter
@app.post("/items")
def create_item(item: Item):
  items.append(item)
  return items

# if /items?limit=2, it will return first 2 items
# if only /items, it will return first 10 items (default)
@app.get("/items")
def lost_items(limit: int = 10, response_model=list[Item]):
  return items[:limit]

@app.get("/items/{item_id}", response_model=Item)
def read_item(item_id: int) -> Item:
  if item_id >= len(items) or item_id < 0:
    raise HTTPException(status_code=404, detail=f"Item with id {item_id} not found")
  return {"item_id": item_id, "item": items[item_id]}


# Get, POST, PUT, DELETE






# command line

# yt tutorial:
# curl -X POST -H "Content-Type: application/json" 'http://127.0.0.1:8000/items?item=SampleItem'

#gpt:
# curl -X POST "http://127.0.0.1:8000/items?item=SampleItem"
# curl -X POST "http://127.0.0.1:8000/items?item=\"SampleItem\""



# sth different
# curl -X POST "http://localhost:8000/items?item=\"SampleItem\""