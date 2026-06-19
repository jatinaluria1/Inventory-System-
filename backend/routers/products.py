from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List
import sqlalchemy.exc

from ..database import get_db
from .. import models, schemas

router = APIRouter(prefix="/products", tags=["products"])

@router.post("", response_model=schemas.ProductResponse, status_code=status.HTTP_201_CREATED)
async def create_product(product: schemas.ProductCreate, db: AsyncSession = Depends(get_db)):
    db_product = models.Product(**product.model_dump())
    db.add(db_product)
    try:
        await db.commit()
        await db.refresh(db_product)
        return db_product
    except sqlalchemy.exc.IntegrityError:
        await db.rollback()
        raise HTTPException(status_code=400, detail="SKU already exists")

@router.get("", response_model=List[schemas.ProductResponse])
async def read_products(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.Product).offset(skip).limit(limit))
    return result.scalars().all()

@router.get("/{product_id}", response_model=schemas.ProductResponse)
async def read_product(product_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.Product).filter(models.Product.id == product_id))
    product = result.scalar_one_or_none()
    if product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@router.put("/{product_id}", response_model=schemas.ProductResponse)
async def update_product(product_id: int, product: schemas.ProductUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.Product).filter(models.Product.id == product_id))
    db_product = result.scalar_one_or_none()
    if db_product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    
    update_data = product.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_product, key, value)
        
    try:
        await db.commit()
        await db.refresh(db_product)
        return db_product
    except sqlalchemy.exc.IntegrityError:
        await db.rollback()
        raise HTTPException(status_code=400, detail="SKU already exists")

@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_product(product_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.Product).filter(models.Product.id == product_id))
    product = result.scalar_one_or_none()
    if product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    
    await db.delete(product)
    await db.commit()
