import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { Tutor } from '../sessoes/tutores/tutores.model';
import { TutorService } from './tutor';
import {
  Consulta,
  NovaConsulta,
  Veterinario,
  hhmm,
  minutos,
  semanaInicial,
} from '../sessoes/agenda/agenda.model';
import {
  TUTORES_MOCK,
  VETERINARIOS_MOCK,
  gerarConsultasMock,
} from '../sessoes/agenda/agenda.mock';

/**
 * true  = usa dados em memória (não precisa do backend rodando).
 * false = usa a API FastAPI em http://localhost:8000.
 * Para conectar ao banco, basta mudar para false.
 */
const USAR_MOCK = true;

const API = 'http://localhost:8000';

@Injectable({ providedIn: 'root' })
export class AgendaService {
  private http = inject(HttpClient);
  private tutorService = inject(TutorService);

  private mock: Consulta[] = gerarConsultasMock(semanaInicial());
  private proximoId = 100;

  listar(inicio: string, fim: string): Observable<Consulta[]> {
    if (USAR_MOCK) {
      return of(this.mock.filter((c) => c.data >= inicio && c.data <= fim).map((c) => ({ ...c })));
    }
    const params = new HttpParams().set('inicio', inicio).set('fim', fim);
    return this.http.get<Consulta[]>(`${API}/consultas/`, { params });
  }

  /** REQ 07 */
  agendar(dados: NovaConsulta): Observable<Consulta> {
    if (USAR_MOCK) return this.agendarMock(dados);
    return this.http.post<Consulta>(`${API}/consultas/`, dados);
  }

  /** REQ 08 */
  cancelar(id: number, motivo: string | null): Observable<Consulta> {
    if (USAR_MOCK) return this.cancelarMock(id, motivo);
    return this.http.patch<Consulta>(`${API}/consultas/${id}/cancelar`, { motivo });
  }

  listarTutores(): Observable<Tutor[]> {
    return USAR_MOCK ? of(TUTORES_MOCK) : this.tutorService.listar();
  }

  // TODO(REQ 06): trocar por this.http.get<Veterinario[]>(`${API}/veterinarios/`)
  // quando o PR de veterinários for aprovado, e apagar VETERINARIOS_MOCK.
  listarVeterinarios(): Observable<Veterinario[]> {
    return of(VETERINARIOS_MOCK);
  }

  // ---------------- mock: reproduz as mesmas regras do backend ----------------

  private erro(status: number, detail: string) {
    return throwError(() => ({ status, error: { detail } }));
  }

  private agendarMock(d: NovaConsulta): Observable<Consulta> {
    const tutor = TUTORES_MOCK.find((t) => t.id === d.tutor_id);
    const animal = tutor?.animais.find((a) => a.id === d.animal_id);
    if (!tutor) return this.erro(404, 'Tutor não encontrado');
    if (!animal) return this.erro(400, 'O animal não pertence a este tutor');
    if (new Date(`${d.data}T${d.hora_inicio}`) < new Date()) {
      return this.erro(400, 'Não é possível agendar no passado');
    }
    const ini = minutos(d.hora_inicio);
    const fim = ini + d.duracao_min;
    const conflito = this.mock.find(
      (c) =>
        c.veterinario_id === d.veterinario_id &&
        c.data === d.data &&
        c.status !== 'cancelada' &&
        ini < minutos(c.hora_inicio) + c.duracao_min &&
        minutos(c.hora_inicio) < fim,
    );
    if (conflito) {
      return this.erro(
        409,
        `O veterinário já tem uma consulta às ${hhmm(conflito.hora_inicio)} neste dia`,
      );
    }
    const nova: Consulta = {
      ...d,
      id: this.proximoId++,
      animal_nome: animal.nome,
      tutor_nome: tutor.nome,
      status: 'aguardando',
      motivo_cancelamento: null,
    };
    this.mock.push(nova);
    return of({ ...nova });
  }

  private cancelarMock(id: number, motivo: string | null): Observable<Consulta> {
    const c = this.mock.find((x) => x.id === id);
    if (!c) return this.erro(404, 'Consulta não encontrada');
    if (c.status === 'cancelada') return this.erro(400, 'A consulta já está cancelada');
    if (c.status === 'concluida' || c.status === 'em_atendimento') {
      return this.erro(400, 'Só é possível cancelar consultas ainda não iniciadas');
    }
    c.status = 'cancelada';
    c.motivo_cancelamento = motivo;
    return of({ ...c });
  }
}
