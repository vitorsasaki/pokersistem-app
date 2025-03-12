<template>
  <div>
    <div class="row">
      <div class="col-12">
        <card>
          <template slot="header">
            <div class="d-flex justify-content-between align-items-center">
              <h4 class="card-title">Ranking de Jogadores</h4>
            </div>
          </template>
          
          <div v-if="carregando" class="text-center my-5">
            <i class="fa fa-spinner fa-spin fa-3x"></i>
            <p class="mt-2">Carregando ranking...</p>
          </div>

          <div v-else-if="erro" class="alert alert-danger" role="alert">
            {{ erro }}
          </div>

          <div v-else>          
            <!-- Filtros -->
            <div class="row mb-4">
              <div class="col-md-4">
                <div class="form-group">
                  <label>Mês</label>
                  <select class="form-control" v-model="filtros.mes">
                    <option value="">Todos</option>
                    <option v-for="(mes, index) in nomesMeses" :key="index" :value="index + 1">
                      {{ mes }}
                    </option>
                  </select>
                </div>
              </div>
              <div class="col-md-4">
                <div class="form-group">
                  <label>Ano</label>
                  <select class="form-control" v-model="filtros.ano">
                    <option value="">Todos</option>
                    <option v-for="ano in anos" :key="ano" :value="ano">
                      {{ ano }}
                    </option>
                  </select>
                </div>
              </div>
              <div class="col-md-4">
                <div class="form-group">
                  <label>Jogador</label>
                  <input
                    type="text"
                    class="form-control"
                    v-model="filtros.jogador"
                    placeholder="Digite o nome do jogador"
                  />
                </div>
              </div>
            </div>

            <div class="table-responsive">
              <table class="table">
                <thead>
                  <tr>
                    <th>Mês/Ano</th>
                    <th>Jogador</th>
                    <th>Pontos</th>
                    <th>1º Lugares</th>
                    <th>Participações</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="ranking in rankingList" :key="ranking.id">
                    <td>{{ formatarMesAno(ranking.mes, ranking.ano) }}</td>
                    <td>{{ ranking.jogador?.nomeReal || '-' }}</td>
                    <td>{{ ranking.pontos }}</td>
                    <td>{{ ranking.qtdPrimeiroLugar }}</td>
                    <td>{{ ranking.numParticipacao }}</td>
                  </tr>
                  <tr v-if="!rankingList.length">
                    <td colspan="5" class="text-center">Nenhum resultado encontrado</td>
                  </tr>
                </tbody>
              </table>

              <!-- Paginação -->
              <div v-if="totalItens > 0" class="d-flex justify-content-between align-items-center mt-4">
                <div class="text-muted">
                  Mostrando {{ inicioContagem }} 
                  a {{ fimContagem }} 
                  de {{ totalItens }} registros
                </div>
                <nav aria-label="Navegação de páginas">
                  <ul class="pagination mb-0">
                    <li :class="['page-item', { disabled: paginaAtual === 1 }]">
                      <a class="page-link" href="#" @click.prevent="mudarPagina(paginaAtual - 1)">
                        <i class="ti-angle-left"></i>
                      </a>
                    </li>
                    <li 
                      v-for="pagina in paginas" 
                      :key="pagina"
                      :class="['page-item', { active: pagina === paginaAtual }]"
                    >
                      <a class="page-link" href="#" @click.prevent="mudarPagina(pagina)">
                        {{ pagina }}
                      </a>
                    </li>
                    <li :class="['page-item', { disabled: paginaAtual === totalPaginas }]">
                      <a class="page-link" href="#" @click.prevent="mudarPagina(paginaAtual + 1)">
                        <i class="ti-angle-right"></i>
                      </a>
                    </li>
                  </ul>
                </nav>
              </div>
            </div>
          </div>
        </card>
      </div>
    </div>
  </div>
</template>

<script>
import Card from '@/components/Cards/Card.vue'
import axios from '@/config/axios'

export default {
  components: {
    Card
  },
  data() {
    return {
      todosRankings: [],
      rankings: [],
      carregando: true,
      erro: null,
      paginaAtual: 1,
      itensPorPagina: 10,
      totalItens: 0,
      filtros: {
        mes: '',
        ano: '',
        jogador: ''
      },
      nomesMeses: [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
      ]
    }
  },
  computed: {
    anos() {
      const anoAtual = new Date().getFullYear()
      const anos = []
      for (let i = anoAtual; i >= 2020; i--) {
        anos.push(i)
      }
      return anos
    },
    rankingsFiltrados() {
      let rankings = this.todosRankings

      // Filtro por Mês
      if (this.filtros.mes) {
        rankings = rankings.filter(r => 
          r.mes === parseInt(this.filtros.mes)
        )
      }

      // Filtro por Ano
      if (this.filtros.ano) {
        rankings = rankings.filter(r => 
          r.ano === parseInt(this.filtros.ano)
        )
      }

      // Filtro por Jogador
      if (this.filtros.jogador) {
        const termoBusca = this.filtros.jogador.toLowerCase()
        rankings = rankings.filter(r => 
          r.jogador?.nomeReal?.toLowerCase().includes(termoBusca)
        )
      }

      return rankings
    },
    rankingList() {
      return this.rankings || []
    },
    totalPaginas() {
      return Math.max(1, Math.ceil(this.totalItens / this.itensPorPagina))
    },
    inicioContagem() {
      return this.totalItens === 0 ? 0 : (this.paginaAtual * this.itensPorPagina - this.itensPorPagina + 1)
    },
    fimContagem() {
      return Math.min(this.paginaAtual * this.itensPorPagina, this.totalItens)
    },
    paginas() {
      const paginas = []
      if (this.totalPaginas <= 1) return paginas

      let inicio = Math.max(1, this.paginaAtual - 2)
      let fim = Math.min(this.totalPaginas, this.paginaAtual + 2)

      if (fim - inicio < 4) {
        if (inicio === 1) {
          fim = Math.min(5, this.totalPaginas)
        } else {
          inicio = Math.max(1, fim - 4)
        }
      }

      for (let i = inicio; i <= fim; i++) {
        paginas.push(i)
      }
      return paginas
    }
  },
  watch: {
    'filtros.mes'() {
      this.paginaAtual = 1
      this.aplicarPaginacao()
    },
    'filtros.ano'() {
      this.paginaAtual = 1
      this.aplicarPaginacao()
    },
    'filtros.jogador'() {
      this.paginaAtual = 1
      this.aplicarPaginacao()
    },
    rankingsFiltrados() {
      this.totalItens = this.rankingsFiltrados.length
      this.aplicarPaginacao()
    }
  },
  methods: {
    async carregarRanking() {
      try {
        this.carregando = true
        this.erro = null
        const response = await axios.get('/ranking')
        
        if (response.data) {
          this.todosRankings = Array.isArray(response.data) ? response.data : 
                           (response.data.content || response.data.data || [])
          
          this.totalItens = this.todosRankings.length
          this.aplicarPaginacao()
          console.log('Ranking carregado:', this.todosRankings)
        } else {
          throw new Error('Resposta vazia da API')
        }
      } catch (error) {
        console.error('Erro ao carregar ranking:', error)
        this.erro = `Erro ao carregar o ranking: ${error.message}`
        this.todosRankings = []
        this.rankings = []
        this.totalItens = 0
      } finally {
        this.carregando = false
      }
    },
    aplicarPaginacao() {
      const inicio = (this.paginaAtual - 1) * this.itensPorPagina
      const fim = inicio + this.itensPorPagina
      this.rankings = this.rankingsFiltrados.slice(inicio, fim)
    },
    mudarPagina(pagina) {
      if (pagina >= 1 && pagina <= this.totalPaginas && pagina !== this.paginaAtual) {
        this.paginaAtual = pagina
        this.aplicarPaginacao()
      }
    },
    limparFiltros() {
      this.filtros.mes = ''
      this.filtros.ano = ''
      this.filtros.jogador = ''
      this.paginaAtual = 1
      this.aplicarPaginacao()
    },
    formatarMesAno(mes, ano) {
      if (!mes || !ano) return '-'
      return `${this.nomesMeses[parseInt(mes) - 1]}/${ano}`
    }
  },
  mounted() {
    this.carregarRanking()
  }
}
</script>

<style>
.page-link {
  padding: 0.5rem 0.75rem;
  color: #51cbce;
  background-color: #fff;
  border: 1px solid #dee2e6;
}
.page-link:hover {
  color: #34b5b8;
  background-color: #e9ecef;
  border-color: #dee2e6;
}
.page-item.active .page-link {
  background-color: #51cbce;
  border-color: #51cbce;
}
.page-item.disabled .page-link {
  color: #6c757d;
  pointer-events: none;
  background-color: #fff;
  border-color: #dee2e6;
}
</style> 