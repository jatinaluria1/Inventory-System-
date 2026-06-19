from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import contextlib

from .database import engine, Base
from .routers import products, customers, orders

@contextlib.asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB schema
    async with engine.begin() as conn:
        # In production, use alembic. Using create_all for simplicity here.
        await conn.run_sync(Base.metadata.create_all)
    yield

app = FastAPI(title="Inventory System API", lifespan=lifespan)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all for assessment
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(products.router)
app.include_router(customers.router)
app.include_router(orders.router)

@app.get("/")
async def root():
    return {"message": "Inventory System API is running"}
