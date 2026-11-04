from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app import models
from app.schemas.tutor import (
    TutorCreate, TutorUpdate, TutorOut, AnimalCreate, AnimalOut,
)

router = APIRouter(prefix="/tutores", tags=["Tutores"])


def buscar_tutor(db: Session, tutor_id: int) -> models.Tutor:
    tutor = db.query(models.Tutor).filter_by(id=tutor_id).first()
    if not tutor:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Tutor não encontrado")
    return tutor


@router.get("/", response_model=list[TutorOut])
def listar_tutores(db: Session = Depends(get_db)):
    return db.query(models.Tutor).all()


@router.get("/{tutor_id}", response_model=TutorOut)
def obter_tutor(tutor_id: int, db: Session = Depends(get_db)):
    return buscar_tutor(db, tutor_id)


@router.post("/", response_model=TutorOut, status_code=status.HTTP_201_CREATED)
def criar_tutor(dados: TutorCreate, db: Session = Depends(get_db)):
    if db.query(models.Tutor).filter_by(cpf=dados.cpf).first():
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "CPF já cadastrado")
    tutor = models.Tutor(**dados.model_dump(exclude={"animais"}))
    tutor.animais = [models.Animal(**a.model_dump()) for a in dados.animais]
    db.add(tutor)
    db.commit()
    db.refresh(tutor)
    return tutor


@router.put("/{tutor_id}", response_model=TutorOut)
def atualizar_tutor(tutor_id: int, dados: TutorUpdate, db: Session = Depends(get_db)):
    tutor = buscar_tutor(db, tutor_id)
    for campo, valor in dados.model_dump(exclude_unset=True).items():
        setattr(tutor, campo, valor)
    db.commit()
    db.refresh(tutor)
    return tutor


@router.delete("/{tutor_id}", status_code=status.HTTP_204_NO_CONTENT)
def deletar_tutor(tutor_id: int, db: Session = Depends(get_db)):
    tutor = buscar_tutor(db, tutor_id)
    db.delete(tutor)
    db.commit()


@router.post("/{tutor_id}/animais", response_model=AnimalOut, status_code=status.HTTP_201_CREATED)
def adicionar_animal(tutor_id: int, dados: AnimalCreate, db: Session = Depends(get_db)):
    buscar_tutor(db, tutor_id)
    animal = models.Animal(**dados.model_dump(), tutor_id=tutor_id)
    db.add(animal)
    db.commit()
    db.refresh(animal)
    return animal


@router.delete("/{tutor_id}/animais/{animal_id}", status_code=status.HTTP_204_NO_CONTENT)
def remover_animal(tutor_id: int, animal_id: int, db: Session = Depends(get_db)):
    animal = db.query(models.Animal).filter_by(id=animal_id, tutor_id=tutor_id).first()
    if not animal:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Animal não encontrado")
    db.delete(animal)
    db.commit()