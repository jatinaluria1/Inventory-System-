from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List
import sqlalchemy.exc

from ..database import get_db
from .. import models, schemas

router = APIRouter(prefix="/customers", tags=["customers"])

@router.post("", response_model=schemas.CustomerResponse, status_code=status.HTTP_201_CREATED)
async def create_customer(customer: schemas.CustomerCreate, db: AsyncSession = Depends(get_db)):
    db_customer = models.Customer(**customer.model_dump())
    db.add(db_customer)
    try:
        await db.commit()
        await db.refresh(db_customer)
        return db_customer
    except sqlalchemy.exc.IntegrityError:
        await db.rollback()
        raise HTTPException(status_code=400, detail="Email already exists")

@router.get("", response_model=List[schemas.CustomerResponse])
async def read_customers(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.Customer).offset(skip).limit(limit))
    return result.scalars().all()

@router.get("/{customer_id}", response_model=schemas.CustomerResponse)
async def read_customer(customer_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.Customer).filter(models.Customer.id == customer_id))
    customer = result.scalar_one_or_none()
    if customer is None:
        raise HTTPException(status_code=404, detail="Customer not found")
    return customer

@router.delete("/{customer_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_customer(customer_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.Customer).filter(models.Customer.id == customer_id))
    customer = result.scalar_one_or_none()
    if customer is None:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    await db.delete(customer)
    await db.commit()
