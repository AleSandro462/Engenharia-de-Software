from datetime import date, datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app import models
from app.schemas.consulta import ConsultaCancelar, ConsultaCreate, ConsultaOut

router = APIRouter(prefix="/consultas", tags=["Consultas"])


def buscar_consulta(db: Session, consulta_id: int) -> models.Consulta:
    consulta = db.query(models.Consulta).filter_by(id=consulta_id).first()
    if not consulta:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Consulta não encontrada")
    return consulta


def _intervalo(data: date, hora, duracao_min: int):
    inicio = datetime.combine(data, hora)
    return inicio, inicio + timedelta(minutes=duracao_min)


@router.get("/", response_model=list[ConsultaOut])
def listar_consultas(
    inicio: date | None = Query(None, description="Data inicial (inclusive)"),
    fim: date | None = Query(None, description="Data final (inclusive)"),
    veterinario_id: int | None = None,
    status_consulta: str | None = Query(None, alias="status"),
    db: Session = Depends(get_db),
):
    q = db.query(models.Consulta)
    if inicio:
        q = q.filter(models.Consulta.data >= inicio)
    if fim:
        q = q.filter(models.Consulta.data <= fim)
    if veterinario_id:
        q = q.filter(models.Consulta.veterinario_id == veterinario_id)
    if status_consulta:
        q = q.filter(models.Consulta.status == status_consulta)
    return q.order_by(models.Consulta.data, models.Consulta.hora_inicio).all()


@router.get("/{consulta_id}", response_model=ConsultaOut)
def obter_consulta(consulta_id: int, db: Session = Depends(get_db)):
    return buscar_consulta(db, consulta_id)


@router.post("/", response_model=ConsultaOut, status_code=status.HTTP_201_CREATED)
def agendar_consulta(dados: ConsultaCreate, db: Session = Depends(get_db)):
    tutor = db.query(models.Tutor).filter_by(id=dados.tutor_id).first()
    if not tutor:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Tutor não encontrado")

    animal = db.query(models.Animal).filter_by(id=dados.animal_id).first()
    if not animal:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Animal não encontrado")
    if animal.tutor_id != tutor.id:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "O animal não pertence a este tutor")

    novo_ini, novo_fim = _intervalo(dados.data, dados.hora_inicio, dados.duracao_min)
    if novo_ini < datetime.now():
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Não é possível agendar no passado")

    # Conflito: mesmo veterinário, mesmo dia, horários sobrepostos (canceladas não contam)
    do_dia = (
        db.query(models.Consulta)
        .filter(
            models.Consulta.veterinario_id == dados.veterinario_id,
            models.Consulta.data == dados.data,
            models.Consulta.status != "cancelada",
        )
        .all()
    )
    for c in do_dia:
        ini, fim = _intervalo(c.data, c.hora_inicio, c.duracao_min)
        if novo_ini < fim and ini < novo_fim:
            raise HTTPException(
                status.HTTP_409_CONFLICT,
                f"O veterinário já tem uma consulta às {c.hora_inicio.strftime('%H:%M')} neste dia",
            )

    consulta = models.Consulta(**dados.model_dump(), status="aguardando")
    db.add(consulta)
    db.commit()
    db.refresh(consulta)
    return consulta


@router.patch("/{consulta_id}/cancelar", response_model=ConsultaOut)
def cancelar_consulta(
    consulta_id: int, dados: ConsultaCancelar | None = None, db: Session = Depends(get_db)
):
    consulta = buscar_consulta(db, consulta_id)
    if consulta.status == "cancelada":
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "A consulta já está cancelada")
    if consulta.status in ("concluida", "em_atendimento"):
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST, "Só é possível cancelar consultas ainda não iniciadas"
        )
    consulta.status = "cancelada"
    consulta.motivo_cancelamento = dados.motivo if dados else None
    db.commit()
    db.refresh(consulta)
    return consulta
