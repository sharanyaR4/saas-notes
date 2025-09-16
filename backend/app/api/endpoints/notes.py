from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.schemas.note import Note, NoteCreate, NoteUpdate
from app.crud import note as crud_note, tenant as crud_tenant
from app.core.auth import require_member_or_admin
from app.core.exceptions import NoteNotFound, NoteLimitReached
from app.models.tenant import SubscriptionPlan

router = APIRouter()

@router.post("/notes", response_model=Note)
async def create_note(
    note_data: NoteCreate,
    db: Session = Depends(get_db),
    current_user = Depends(require_member_or_admin)
):
    # Check subscription limits
    tenant = crud_tenant.get_tenant_by_id(db, current_user.tenant_id)
    if tenant.subscription_plan == SubscriptionPlan.FREE:
        note_count = crud_note.count_notes_by_tenant(db, current_user.tenant_id)
        if note_count >= 3:
            raise NoteLimitReached()
    
    note = crud_note.create_note(
        db=db,
        note=note_data,
        user_id=current_user.id,
        tenant_id=current_user.tenant_id
    )
    return note

@router.get("/notes", response_model=List[Note])
async def get_notes(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user = Depends(require_member_or_admin)
):
    notes = crud_note.get_notes_by_tenant(
        db=db,
        tenant_id=current_user.tenant_id,
        skip=skip,
        limit=limit
    )
    return notes

@router.get("/notes/{note_id}", response_model=Note)
async def get_note(
    note_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(require_member_or_admin)
):
    note = crud_note.get_note_by_id(
        db=db,
        note_id=note_id,
        tenant_id=current_user.tenant_id
    )
    if not note:
        raise NoteNotFound()
    return note

@router.put("/notes/{note_id}", response_model=Note)
async def update_note(
    note_id: int,
    note_data: NoteUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(require_member_or_admin)
):
    note = crud_note.update_note(
        db=db,
        note_id=note_id,
        tenant_id=current_user.tenant_id,
        note_update=note_data
    )
    if not note:
        raise NoteNotFound()
    return note

@router.delete("/notes/{note_id}")
async def delete_note(
    note_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(require_member_or_admin)
):
    success = crud_note.delete_note(
        db=db,
        note_id=note_id,
        tenant_id=current_user.tenant_id
    )
    if not success:
        raise NoteNotFound()
    return {"message": "Note deleted successfully"}