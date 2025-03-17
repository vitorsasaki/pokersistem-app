<template>
  <div>
    <div class="row">
      <div class="col-12">
        <card>
          <template slot="header">
            <div class="d-flex justify-content-between align-items-center">
              <h4 class="card-title">Resultados do Torneio</h4>
              <div>
                <button 
                  class="btn btn-success btn-sm mr-2"
                  @click="atualizarRanking"
                  :disabled="atualizandoRanking"
                >
                  <i class="ti-reload mr-1" :class="{ 'fa-spin': atualizandoRanking }"></i>
                  Atualizar Ranking
                </button>
                <button 
                  class="btn btn-primary btn-sm mr-2"
                  @click="abrirModalLista"
                >
                  <i class="ti-list mr-1"></i>
                  Nova Lista
                </button>
                <button 
                  class="btn btn-primary btn-sm"
                  @click="abrirModalNovoResultado"
                >
                  <i class="ti-plus mr-1"></i>
                  Novo Resultado
                </button>
              </div>
            </div>
          </template>
          
          <div v-if="carregando" class="text-center my-5">
            <i class="fa fa-spinner fa-spin fa-3x"></i>
            <p class="mt-2">Carregando resultados...</p>
          </div>

          <div v-else-if="erro" class="alert alert-danger" role="alert">
            {{ erro }}
          </div>

          <div v-else>          
            <!-- Filtros -->
            <div class="row mb-4">
              <div class="col-md-3">
                <div class="form-group">
                  <label>Jogador</label>
                  <v-select
                    v-model="filtros.jogador"
                    :options="jogadores"
                    :reduce="jogador => jogador"
                    label="nome"
                    :get-option-label="getJogadorLabel"
                    placeholder="Digite para buscar jogador..."
                    class="vue-select-custom"
                    clearable
                  />
                </div>
              </div>
              <div class="col-md-3">
                <div class="form-group">
                  <label>Torneio</label>
                  <v-select
                    v-model="filtros.torneio"
                    :options="torneios"
                    :get-option-label="(option) => `ID: ${option.id} - ${formatarMesAno(option.mesRanking, option.anoRanking)}`"
                    placeholder="Selecione um torneio"
                    clearable
                  />
                </div>
              </div>
              <div class="col-md-3">
                <div class="form-group">
                  <label>Mês</label>
                  <select class="form-control" v-model="filtros.mes">
                    <option value="">Todos</option>
                    <option v-for="(mes, index) in nomesMeses" :key="index + 1" :value="index + 1">
                      {{ mes }}
                    </option>
                  </select>
                </div>
              </div>
              <div class="col-md-3">
                <div class="form-group">
                  <label>Ano</label>
                  <select class="form-control" v-model="filtros.ano">
                    <option value="">Todos</option>
                    <option v-for="ano in anos" :key="ano" :value="ano">{{ ano }}</option>
                  </select>
                </div>
              </div>
              <div class="col-md-3">
                <div class="form-group">
                  <label>Ponto Bônus</label>
                  <select class="form-control" v-model="filtros.pontoBonus">
                    <option value="">Todos</option>
                    <option value="SIM">Sim</option>
                    <option value="NAO">Não</option>
                  </select>
                </div>
              </div>
              <div class="col-md-3 d-flex align-items-end">
                <button class="btn btn-secondary" @click="limparFiltros">
                  Limpar Filtros
                </button>
              </div>
            </div>

            <div class="table-responsive">
              <table class="table">
                <thead>
                  <tr>
                    <th>Posição</th>
                    <th>Nick</th>
                    <th>Jogador</th>
                    <th>Torneio ID</th>
                    <th>Mês/Ano</th>                    
                    <th>Total de Pontos</th>
                    <th>Ponto Bônus</th>
                    <th>Atualizado</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="resultado in resultadosList" :key="resultado.id">
                    <td>{{ resultado.posicao }}</td>
                    <td>{{ resultado.jogador?.nome || '-' }}</td>
                    <td>{{ resultado.jogador?.nomeReal || '-' }}</td>
                    <td>{{ resultado.torneio?.id || '-' }}</td>
                    <td>{{ formatarMesAno(resultado.torneio?.mesRanking, resultado.torneio?.anoRanking) }}</td>                    
                    <td>{{ resultado.totalPontosGanho }}</td>
                    <td>{{ resultado.pontoBonus === 'SIM' ? 'Sim' : 'Não' }}</td>
                    <td>{{ resultado.atualizado === 'SIM' ? 'Sim' : 'Não' }}</td>
                    <td>
                      <button class="btn btn-info btn-sm mr-2" @click="editarResultado(resultado)" title="Editar">
                        <i class="ti-pencil"></i>
                      </button>
                      <button class="btn btn-danger btn-sm" @click="excluirResultado(resultado)" title="Excluir">
                        <i class="ti-trash"></i>
                      </button>
                    </td>
                  </tr>
                  <tr v-if="!resultadosList.length">
                    <td colspan="6" class="text-center">Nenhum resultado encontrado</td>
                  </tr>
                </tbody>
              </table>

              <!-- Paginação -->
              <div v-if="totalItens > 0" class="d-flex justify-content-between align-items-center mt-4">
                <div class="text-muted">
                  Mostrando {{ inicioContagem }} 
                  a {{ fimContagem }} 
                  de {{ totalItens }} resultados
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

    <!-- Modal de Resultado -->
    <resultado-torneio-modal
      :show="showModal"
      :resultado-edit="resultadoSelecionado"
      @fechar="fecharModal"
      @salvar="salvarResultado"
    />

    <!-- Modal de Lista de Resultados -->
    <resultado-torneio-lista-modal
      :show="showModalLista"
      @fechar="fecharModalLista"
      @salvar="carregarResultados"
    />
  </div>
</template>

<script>
import Card from '@/components/Cards/Card.vue'
import axios from '@/config/axios'
import ResultadoTorneioModal from '@/components/Modals/ResultadoTorneioModal.vue'
import ResultadoTorneioListaModal from '@/components/Modals/ResultadoTorneioListaModal.vue'
import vSelect from 'vue-select'
import 'vue-select/dist/vue-select.css'

export default {
  components: {
    Card,
    ResultadoTorneioModal,
    ResultadoTorneioListaModal,
    vSelect
  },
  data() {
    return {
      todosResultados: [],
      resultados: [],
      jogadores: [],
      torneios: [],
      carregando: true,
      erro: null,
      paginaAtual: 1,
      itensPorPagina: 10,
      totalItens: 0,
      showModal: false,
      resultadoSelecionado: null,
      filtros: {
        jogador: null,
        torneio: null,
        mes: '',
        ano: '',
        pontoBonus: ''
      },
      nomesMeses: [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
      ],
      showModalLista: false,
      atualizandoRanking: false
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
    resultadosFiltrados() {
      let resultados = this.todosResultados

      if (this.filtros.jogador) {
        resultados = resultados.filter(r => r.jogador?.id === this.filtros.jogador.id)
      }

      if (this.filtros.torneio) {
        resultados = resultados.filter(r => r.torneio?.id === this.filtros.torneio.id)
      }

      if (this.filtros.mes) {
        resultados = resultados.filter(r => r.torneio?.mesRanking === parseInt(this.filtros.mes))
      }

      if (this.filtros.ano) {
        resultados = resultados.filter(r => r.torneio?.anoRanking === parseInt(this.filtros.ano))
      }

      if (this.filtros.pontoBonus) {
        resultados = resultados.filter(r => r.pontoBonus === this.filtros.pontoBonus)
      }

      return resultados
    },
    resultadosList() {
      return this.resultados || []
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
    },
    obterPlaceholderFiltro() {
      const placeholders = {
        jogador: 'Digite o nome do jogador',
        torneio: 'Digite o nome do torneio',
        posicao: 'Digite a posição',
        totalPontosGanho: 'Digite o total de pontos'
      }
      return this.filtro.campo ? placeholders[this.filtro.campo] : 'Selecione um campo para filtrar'
    }
  },
  watch: {
    filtros: {
      deep: true,
      handler() {
        this.paginaAtual = 1
        this.aplicarPaginacao()
      }
    },
    resultadosFiltrados() {
      this.totalItens = this.resultadosFiltrados.length
      this.aplicarPaginacao()
    }
  },
  methods: {
    async carregarResultados() {
      try {
        this.carregando = true
        this.erro = null
        const response = await axios.get('/resultadoTorneio')
        
        if (response.data) {
          this.todosResultados = Array.isArray(response.data) ? response.data : 
                           (response.data.content || response.data.data || [])
          
          this.totalItens = this.todosResultados.length
          this.aplicarPaginacao()
          console.log('Resultados carregados:', this.todosResultados)
        } else {
          throw new Error('Resposta vazia da API')
        }
      } catch (error) {
        console.error('Erro ao carregar resultados:', error)
        this.erro = `Erro ao carregar a lista de resultados: ${error.message}`
        this.todosResultados = []
        this.resultados = []
        this.totalItens = 0
      } finally {
        this.carregando = false
      }
    },
    async carregarJogadores() {
      try {
        const response = await axios.get('/jogadores')
        this.jogadores = response.data || []
        console.log('Jogadores carregados:', this.jogadores)
      } catch (error) {
        console.error('Erro ao carregar jogadores:', error)
        this.jogadores = []
      }
    },
    async carregarTorneios() {
      try {
        const response = await axios.get('/torneio')
        this.torneios = response.data || []
        this.torneios.sort((a, b) => b.id - a.id)
      } catch (error) {
        console.error('Erro ao carregar torneios:', error)
        this.torneios = []
      }
    },
    aplicarPaginacao() {
      const inicio = (this.paginaAtual - 1) * this.itensPorPagina
      const fim = inicio + this.itensPorPagina
      this.resultados = this.resultadosFiltrados.slice(inicio, fim)
    },
    mudarPagina(pagina) {
      if (pagina >= 1 && pagina <= this.totalPaginas && pagina !== this.paginaAtual) {
        this.paginaAtual = pagina
        this.aplicarPaginacao()
      }
    },
    limparFiltros() {
      this.filtros = {
        jogador: null,
        torneio: null,
        mes: '',
        ano: '',
        pontoBonus: ''
      }
    },
    async excluirResultado(resultado) {
      if (resultado && confirm(`Tem certeza que deseja excluir este resultado?`)) {
        try {
          await axios.delete(`/resultadoTorneio/${resultado.id}`)
          await this.carregarResultados()
          if (this.resultados.length === 0 && this.paginaAtual > 1) {
            this.paginaAtual--
            this.aplicarPaginacao()
          }
          this.$notify({
            message: 'Resultado excluído com sucesso!',
            type: 'success'
          })
        } catch (error) {
          console.error('Erro ao excluir resultado:', error)
          this.$notify({
            message: 'Erro ao excluir resultado. Por favor, tente novamente.',
            type: 'danger'
          })
        }
      }
    },
    abrirModalNovoResultado() {
      this.resultadoSelecionado = null
      this.showModal = true
    },
    editarResultado(resultado) {
      this.resultadoSelecionado = { ...resultado }
      this.showModal = true
    },
    fecharModal() {
      this.showModal = false
      this.resultadoSelecionado = null
    },
    async salvarResultado(resultado) {
      try {
        console.log('Tentando salvar resultado:', resultado)
        
        if (resultado.id) {
          const response = await axios.put(`/resultadoTorneio/${resultado.id}`, resultado)
          console.log('Resposta da API (PUT):', response.data)
          this.$notify({
            message: 'Resultado atualizado com sucesso!',
            type: 'success'
          })
        } else {
          const response = await axios.post('/resultadoTorneio', resultado)
          console.log('Resposta da API (POST):', response.data)
          this.$notify({
            message: 'Resultado criado com sucesso!',
            type: 'success'
          })
        }
        
        await this.carregarResultados()
        this.fecharModal()
      } catch (error) {
        console.error('Erro ao salvar resultado:', error)
        console.error('Detalhes do erro:', error.response?.data)
        
        let mensagemErro = 'Erro ao salvar resultado.'
        
        if (error.response?.data?.message) {
          mensagemErro += ` ${error.response.data.message}`
        } else if (error.response?.data?.error) {
          mensagemErro += ` ${error.response.data.error}`
        }
        
        this.$notify({
          message: mensagemErro,
          type: 'danger'
        })
      }
    },
    formatarMesAno(mes, ano) {
      if (!mes || !ano) return '-'
      return `${this.nomesMeses[parseInt(mes) - 1]}/${ano}`
    },
    getJogadorLabel(jogador) {
      return `ID: ${jogador.id} - ${jogador.nome} (${jogador.nomeReal})`
    },
    abrirModalLista() {
      this.showModalLista = true
    },
    fecharModalLista() {
      this.showModalLista = false
    },
    async atualizarRanking() {
      try {
        this.atualizandoRanking = true
        
        // Busca resultados não atualizados
        const responseNaoAtualizados = await axios.get('/resultadoTorneio/naoAtualizados')
        const resultadosNaoAtualizados = responseNaoAtualizados.data
        
        if (!resultadosNaoAtualizados || resultadosNaoAtualizados.length === 0) {
          this.$notify({
            message: 'Não há resultados pendentes para atualizar no ranking.',
            type: 'info'
          })
          return
        }

        // Envia resultados para atualizar o ranking
        await axios.post('/ranking', resultadosNaoAtualizados)
        
        this.$notify({
          message: `Ranking atualizado com sucesso! ${resultadosNaoAtualizados.length} resultados processados.`,
          type: 'success'
        })

      } catch (error) {
        console.error('Erro ao atualizar ranking:', error)
        this.$notify({
          message: `Erro ao atualizar ranking: ${error.response?.data?.message || error.message}`,
          type: 'danger'
        })
      } finally {
        this.atualizandoRanking = false
      }
    }
  },
  async mounted() {
    await Promise.all([
      this.carregarResultados(),
      this.carregarJogadores(),
      this.carregarTorneios()
    ])
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

/* Estilos do v-select */
.v-select {
  background-color: white;
  border-radius: 4px;
}

.v-select .vs__dropdown-toggle {
  padding: 4px 0;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.v-select .vs__selected {
  margin: 0 2px;
  padding: 0 0.25em;
}

.v-select .vs__search {
  margin: 0;
}

.v-select .vs__dropdown-menu {
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-top: 4px;
}

.v-select .vs__dropdown-option {
  padding: 8px 20px;
}

.v-select .vs__dropdown-option--highlight {
  background: #51cbce;
  color: white;
}

.ti-reload {
  transition: transform 0.5s ease;
}

.ti-reload.fa-spin {
  animation: fa-spin 2s infinite linear;
}

@keyframes fa-spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style> 