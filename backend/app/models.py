from sqlalchemy import Column, Integer, String, Date, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


class Tutor(Base):
    __tablename__ = "tutores"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(120), nullable=False)
    cpf = Column(String(14), unique=True, nullable=False)
    telefone = Column(String(20), nullable=False)
    email = Column(String(120), nullable=True)
    endereco = Column(String(255), nullable=True)

    animais = relationship("Animal", back_populates="tutor", cascade="all, delete-orphan")


class Animal(Base):
    __tablename__ = "animais"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(80), nullable=False)
    especie = Column(String(50), nullable=False)
    raca = Column(String(80), nullable=True)
    sexo = Column(String(1), nullable=False)
    data_nascimento = Column(Date, nullable=True)
    tutor_id = Column(Integer, ForeignKey("tutores.id"), nullable=False)

    tutor = relationship("Tutor", back_populates="animais")


    
class Usuario(Base):
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(120), nullable=False)
    email = Column(String(120), unique=True, nullable=False)
    senha_hash = Column(String(255), nullable=False)
    perfil = Column(String(20), nullable=False, default="recepcionista")