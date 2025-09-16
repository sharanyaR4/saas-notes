from sqlalchemy.orm import Session
from app.models.note import Note
from app.schemas.note import NoteCreate, NoteUpdate
from typing import Optional, List

def get_note_by_id(db: Session, note_id: int, tenant_id: int) -> Optional[Note]:
    return db.query(Note).filter(
        Note.id == note_id, 
        Note.tenant_id == tenant_id
    ).first()

def get_notes_by_tenant(db: Session, tenant_id: int, skip: int = 0, limit: int = 100) -> List[Note]:
    return db.query(Note).filter(
        Note.tenant_id == tenant_id
    ).offset(skip).limit(limit).all()

def get_notes_by_user(db: Session, user_id: int, tenant_id: int, skip: int = 0, limit: int = 100) -> List[Note]:
    return db.query(Note).filter(
        Note.user_id == user_id,
        Note.tenant_id == tenant_id
    ).offset(skip).limit(limit).all()

def count_notes_by_tenant(db: Session, tenant_id: int) -> int:
    return db.query(Note).filter(Note.tenant_id == tenant_id).count()

def create_note(db: Session, note: NoteCreate, user_id: int, tenant_id: int) -> Note:
    db_note = Note(
        title=note.title,
        content=note.content,
        user_id=user_id,
        tenant_id=tenant_id
    )
    db.add(db_note)
    db.commit()
    db.refresh(db_note)
    return db_note

def update_note(db: Session, note_id: int, tenant_id: int, note_update: NoteUpdate) -> Optional[Note]:
    db_note = get_note_by_id(db, note_id, tenant_id)
    if not db_note:
        return None
    
    update_data = note_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_note, key, value)
    
    db.commit()
    db.refresh(db_note)
    return db_note

def delete_note(db: Session, note_id: int, tenant_id: int) -> bool:
    db_note = get_note_by_id(db, note_id, tenant_id)
    if not db_note:
        return False
    
    db.delete(db_note)
    db.commit()
    return True