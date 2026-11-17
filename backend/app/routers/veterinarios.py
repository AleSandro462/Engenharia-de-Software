from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Usuario, Veterinario
from ..schemas.veterinario import VeterinarioCreate, VeterinarioResponse

router = APIRouter(
    prefix="/veterinarios",
    tags=["Veterinários"]
)


@router.post("/", response_model=VeterinarioResponse)
def criar_veterinario(vet: VeterinarioCreate, db: Session = Depends(get_db)):
    email = vet.email.strip().lower()
    if db.query(Veterinario).filter(Veterinario.crmv == vet.crmv).first():
        raise HTTPException(status_code=400, detail="CRMV já cadastrado.")
    if db.query(Veterinario).filter(func.lower(Veterinario.email) == email).first():
        raise HTTPException(status_code=400, detail="E-mail já cadastrado.")

    dados = vet.model_dump()
    dados["email"] = email
    novo_vet = Veterinario(**dados)

    db.add(novo_vet)
    db.commit()
    db.refresh(novo_vet)
    return novo_vet


@router.get("/", response_model=list[VeterinarioResponse])
def listar_veterinarios(db: Session = Depends(get_db)):
    return db.query(Veterinario).all()


@router.put("/{vet_id}", response_model=VeterinarioResponse)
def atualizar_veterinario(vet_id: int, vet_atualizado: VeterinarioCreate, db: Session = Depends(get_db)):
    db_vet = db.query(Veterinario).filter(Veterinario.id == vet_id).first()
    if not db_vet:
        raise HTTPException(status_code=404, detail="Veterinário não encontrado.")

    dados = vet_atualizado.model_dump()
    dados["email"] = dados["email"].strip().lower()

    for key, value in dados.items():
        setattr(db_vet, key, value)

    db.commit()
    db.refresh(db_vet)
    return db_vet


@router.delete("/{vet_id}")
def deletar_veterinario(vet_id: int, db: Session = Depends(get_db)):
    db_vet = db.query(Veterinario).filter(Veterinario.id == vet_id).first()
    if not db_vet:
        raise HTTPException(status_code=404, detail="Veterinário não encontrado.")

    db_usuario = (
        db.query(Usuario)
        .filter(func.lower(Usuario.email) == db_vet.email.strip().lower())
        .first()
    )
    if db_usuario:
        db.delete(db_usuario)

    db.delete(db_vet)
    db.commit()
    return {"mensagem": "Veterinário e acesso removidos."}