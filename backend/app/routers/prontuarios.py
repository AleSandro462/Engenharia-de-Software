from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.database import get_db
from app import models
from app.schemas.prontuario import AnimalBusca, ProntuarioOut, RegistroProntuario

router = APIRouter(prefix="/prontuarios", tags=["Prontuarios"])


def montar_animal(a: models.Animal) -> AnimalBusca:
    return AnimalBusca(
        id=a.id,
        nome=a.nome,
        especie=a.especie,
        raca=a.raca,
        tutor_nome=a.tutor.nome,
    )


@router.get("/animais", response_model=list[AnimalBusca])
def buscar_animais(busca: str = "", db: Session = Depends(get_db)):
    consulta = db.query(models.Animal).join(models.Tutor)
    if busca.strip():
        termo = f"%{busca.strip()}%"
        consulta = consulta.filter(
            or_(models.Animal.nome.ilike(termo), models.Tutor.nome.ilike(termo))
        )
    animais = consulta.order_by(models.Animal.nome).limit(20).all()
    return [montar_animal(a) for a in animais]


@router.get("/animais/{animal_id}", response_model=ProntuarioOut)
def obter_prontuario(animal_id: int, db: Session = Depends(get_db)):
    animal = db.get(models.Animal, animal_id)
    if not animal:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Animal não encontrado")

    linhas = (
        db.query(models.Atendimento, models.Consulta, models.Veterinario)
        .join(models.Consulta, models.Atendimento.consulta_id == models.Consulta.id)
        .join(models.Veterinario, models.Consulta.veterinario_id == models.Veterinario.id)
        .filter(models.Consulta.animal_id == animal_id)
        .order_by(models.Consulta.data.desc(), models.Consulta.hora_inicio.desc())
        .all()
    )

    registros = [
        RegistroProntuario(
            atendimento_id=at.id,
            data=c.data,
            hora=c.hora_inicio,
            tipo=c.tipo,
            veterinario_nome=v.nome,
            diagnostico=at.diagnostico,
            observacoes=at.observacoes,
            procedimentos=at.procedimentos,
        )
        for at, c, v in linhas
    ]
    return ProntuarioOut(animal=montar_animal(animal), atendimentos=registros)