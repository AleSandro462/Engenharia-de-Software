# VetCare - Sistema de Gestão para Clínica Veterinária

Projeto da disciplina de Engenharia de Software - Instituto de Computação, Universidade Federal da Bahia (UFBA).

O VetCare é um sistema web para gerenciar o dia a dia de uma clínica veterinária: tutores, animais, profissionais, agenda, atendimentos, prontuários e financeiro.

> Documento de requisitos: versão 01.00, responsável Dra. Larissa Barbosa Leôncio Pinheiro.

---

## Tecnologias

| Camada | Tecnologia |
|---|---|
| Front-end | Angular 22 (componentes standalone, signals) |
| Back-end | Python 3.11 + FastAPI |
| Banco de dados | SQLite, via SQLAlchemy |
| Servidor | Uvicorn |

---

## Estrutura do repositório

```
Engenharia-de-Software/
├── src/                 # Front-end (Angular)
│   └── app/
│       ├── guards/      # Proteção de rotas por perfil
│       ├── layout/      # Layout principal (sidebar e header)
│       ├── pages/       # Login, cadastro, recuperação de senha, dashboard
│       ├── services/    # Comunicação com a API (auth, tutor, veterinário)
│       └── sessoes/     # Telas do sistema (tutores, agenda, veterinários...)
├── backend/             # Back-end (FastAPI)
│   └── app/
│       ├── routers/     # Rotas da API
│       ├── schemas/     # Validação dos dados (Pydantic)
│       ├── models.py    # Tabelas do banco (SQLAlchemy)
│       └── database.py  # Conexão com o banco
├── package.json
└── README.md
```

---

## Como executar

### Pré-requisitos

- [Node.js](https://nodejs.org/) (versão LTS) e npm
- [Angular CLI](https://angular.dev/tools/cli): `npm install -g @angular/cli`
- [Python 3.11+](https://www.python.org/downloads/)
- [Git](https://git-scm.com/)

### 1. Clonar o repositório

```bash
git clone https://github.com/AleSandro462/Engenharia-de-Software.git
cd Engenharia-de-Software
```

### 2. Back-end

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
python -m uvicorn main:app --reload
```

- A API sobe em `http://localhost:8000`.
- A documentação interativa (Swagger) fica em `http://localhost:8000/docs`.
- O banco `vetcare.db` é criado automaticamente na primeira execução.

> Se o `main.py` estiver dentro de `app/`, use `python -m uvicorn app.main:app --reload`.
> No Linux/macOS, ative o ambiente com `source .venv/bin/activate`.
> Se o PowerShell bloquear a ativação, rode antes: `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass`.

### 3. Front-end

Em outro terminal, na raiz do projeto (onde está o `package.json`):

```bash
npm install
ng serve
```

O sistema abre em `http://localhost:4200`.

> O `npm install` e a criação do `.venv` só precisam ser feitos uma vez por clone (e de novo se o `package.json` ou o `requirements.txt` mudarem).

---

## Perfis de acesso

| Perfil | Como é criado | Acesso |
|---|---|---|
| Administrador | Criado automaticamente pelo sistema (único) | Todas as telas |
| Recepcionista | Escolhido pelo usuário no cadastro | Todas as telas, por enquanto |
| Veterinário | Escolhido pelo usuário no cadastro | Apenas Agenda, Atendimentos e Prontuários |

- O cadastro pela tela aceita somente os perfis recepcionista e veterinário. Tentar criar um administrador pela API é recusado.
- As credenciais da conta de administrador ficam definidas no `main.py` do back-end. Altere a senha padrão antes de usar o sistema fora do ambiente de desenvolvimento.
- As senhas são armazenadas com hash e salt (PBKDF2), nunca em texto puro.

---

## Requisitos funcionais

| REQ | Requisito | Prioridade | Situação |
|---|---|---|---|
| 01 | Manter Usuário | Alta | Parcial (cadastro) |
| 02 | Autenticar Usuário | Alta | Parcial (login sem token) |
| 03 | Recuperar Senha | Média | Concluído |
| 04 | Manter Tutor | Alta | Back-end pronto, tela em andamento |
| 05 | Manter Animal | Alta | Back-end parcial |
| 06 | Manter Veterinário | Alta | Concluído |
| 07 | Agendar Consulta | Alta | Pendente |
| 08 | Cancelar Consulta | Alta | Pendente |
| 09 | Consultar Agenda | Alta | Pendente |
| 10 | Registrar Atendimento | Alta | Pendente |
| 11 | Manter Prontuário | Alta | Pendente |
| 12 | Registrar Vacinação | Média | Pendente |
| 13 | Emitir Prescrição | Média | Pendente |
| 14 | Registrar Pagamento | Alta | Pendente |
| 15 | Dashboard Financeiro | Média | Pendente |
| 16 | Notificar Tutor | Média | Pendente |
| 17 | Gerar Relatórios Gerenciais | Média | Pendente |

### Recuperação de senha (REQ 03)

1. Na tela de login, o usuário clica em "Esqueci minha senha" e informa o e-mail.
2. O sistema gera um token temporário (validade de 30 minutos, uso único). Apenas o hash do token é salvo no banco.
3. O envio de e-mail é simulado: o link de recuperação aparece no terminal do back-end.
4. O usuário abre o link e define a nova senha.

A resposta do sistema é a mesma para e-mails cadastrados e não cadastrados, para não revelar quais e-mails existem.

---

## Principais rotas da API

| Método | Rota | Descrição |
|---|---|---|
| POST | `/usuarios/` | Cadastrar usuário |
| POST | `/usuarios/login` | Login |
| POST | `/usuarios/recuperar-senha` | Solicitar recuperação de senha |
| POST | `/usuarios/redefinir-senha` | Definir nova senha com o token |
| GET / POST | `/tutores/` | Listar e cadastrar tutores |
| GET / PUT / DELETE | `/tutores/{id}` | Consultar, alterar e excluir tutor |
| POST | `/tutores/{id}/animais` | Adicionar animal a um tutor |
| DELETE | `/tutores/{id}/animais/{animal_id}` | Remover animal |

A lista completa e atualizada está no Swagger: `http://localhost:8000/docs`.

---

## Limitações conhecidas

- A proteção por perfil existe no front-end (menu e rotas). O back-end ainda não valida token, então a API pode ser chamada diretamente sem autenticação. A implementação de JWT está planejada.
- O envio de e-mail (recuperação de senha e notificações) ainda não é real.
- Qualquer pessoa pode se cadastrar como veterinário, pois não há verificação do registro profissional.

---

## Fluxo de trabalho em equipe

Não fazemos commits direto na `main`. Cada tarefa tem uma branch e entra por Pull Request.

```bash
git checkout main
git pull
git checkout -b feature/nome-da-tarefa

# ...trabalhar...

git add .
git commit -m "descrição do que mudou"
git push -u origin feature/nome-da-tarefa
```

Depois, abrir o Pull Request no GitHub (`base: main` <- `compare: feature/nome-da-tarefa`) e pedir revisão a outra pessoa da equipe.

> Os arquivos `.venv/`, `node_modules/`, `__pycache__/` e `vetcare.db` não vão para o repositório (estão no `.gitignore`).

---

## Equipe

| Nomes | 
|Caio porto|Lucas cerqueira|José medina | Alessandro libertador


---

## Licença

Projeto acadêmico, desenvolvido para fins didáticos.
