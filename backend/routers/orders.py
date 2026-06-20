from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from typing import List

from database import get_db
import models, schemas

router = APIRouter(prefix="/orders", tags=["orders"])

@router.post("", response_model=schemas.OrderResponse, status_code=status.HTTP_201_CREATED)
async def create_order(order: schemas.OrderCreate, db: AsyncSession = Depends(get_db)):
    # Verify customer exists
    customer_result = await db.execute(select(models.Customer).filter(models.Customer.id == order.customer_id))
    if customer_result.scalar_one_or_none() is None:
        raise HTTPException(status_code=404, detail="Customer not found")

    if not order.items:
        raise HTTPException(status_code=400, detail="Order must contain at least one item")

    total_amount = 0.0
    order_items_db = []

    # Verify products and inventory, calculate total
    for item in order.items:
        product_result = await db.execute(select(models.Product).filter(models.Product.id == item.product_id))
        product = product_result.scalar_one_or_none()
        
        if product is None:
            raise HTTPException(status_code=404, detail=f"Product {item.product_id} not found")
        
        if product.quantity_in_stock < item.quantity:
            raise HTTPException(status_code=400, detail=f"Insufficient inventory for product {product.name}. Available: {product.quantity_in_stock}")
        
        # Reduce inventory
        product.quantity_in_stock -= item.quantity
        
        # Calculate item total
        item_total = product.price * item.quantity
        total_amount += item_total
        
        order_items_db.append(
            models.OrderItem(
                product_id=product.id,
                quantity=item.quantity,
                price=product.price
            )
        )

    # Create Order
    db_order = models.Order(
        customer_id=order.customer_id,
        total_amount=total_amount
    )
    db.add(db_order)
    await db.flush() # Get order.id

    for item_db in order_items_db:
        item_db.order_id = db_order.id
        db.add(item_db)

    await db.commit()
    
    # Reload order with items to return full response
    result = await db.execute(
        select(models.Order)
        .options(selectinload(models.Order.items))
        .filter(models.Order.id == db_order.id)
    )
    return result.scalar_one()

@router.get("", response_model=List[schemas.OrderResponse])
async def read_orders(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(models.Order)
        .options(selectinload(models.Order.items))
        .order_by(models.Order.created_at.desc())
        .offset(skip).limit(limit)
    )
    return result.scalars().all()

@router.get("/{order_id}", response_model=schemas.OrderResponse)
async def read_order(order_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(models.Order)
        .options(selectinload(models.Order.items))
        .filter(models.Order.id == order_id)
    )
    order = result.scalar_one_or_none()
    if order is None:
        raise HTTPException(status_code=404, detail="Order not found")
    return order

@router.delete("/{order_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_order(order_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(models.Order)
        .options(selectinload(models.Order.items))
        .filter(models.Order.id == order_id)
    )
    order = result.scalar_one_or_none()
    if order is None:
        raise HTTPException(status_code=404, detail="Order not found")
    
    # Restore inventory stock when order is cancelled
    for item in order.items:
        prod_res = await db.execute(select(models.Product).filter(models.Product.id == item.product_id))
        product = prod_res.scalar_one_or_none()
        if product:
            product.quantity_in_stock += item.quantity
            
    await db.delete(order)
    await db.commit()
