<template>
  <div class="row">
    <div class="col-12">
      <card>
        <template slot="header">
          <div class="d-flex justify-content-between align-items-center">
            <h4 class="card-title">Torneios</h4>
            <button class="btn btn-primary btn-sm" @click="abrirModalNovoTorneio">
              <i class="ti-plus"></i> Novo Torneio
            </button>
          </div>
        </template>
        
        <div v-if="carregando" class="text-center my-5">
          <i class="fa fa-spinner fa-spin fa-3x"></i>
          <p class="mt-2">Carregando torneios...</p>
        </div>

        <div v-else-if="erro" class="alert alert-danger" role="alert">
          {{ erro }}
        </div>

        <div v-else>
          <!-- Seção de Filtros -->
          <div class="card-body pb-0">
            <div class="row align-items-center">
              <div class="col-md-3">
                <div class="form-group">
                  <label>Filtrar por</label>
                  <select class="form-control" v-model="filtro.campo">
                    <option value="">Selecione um campo</option>
                    <option value="id">ID</option>
                    <option value="anoRanking">Ano Ranking</option>
                    <option value="mesRanking">Mês Ranking</option>
                    <option value="dataTorneio">Data Torneio</option>
                    <option value="tipoTorneio">Tipo de Torneio</option>
                    <option value="torneioDoRanking">Torneio do Ranking</option>
                  </select>
                </div>
              </div>
              <div class="col-md-7">
                <div class="form-group">
                  <label>Valor do filtro</label>
                  <input
                    type="text"
                    class="form-control"
                    v-model="filtro.valor"
                    :placeholder="obterPlaceholderFiltro"
                  />
                </div>
              </div>
              <div class="col-md-2 d-flex align-items-end">
                <button class="btn btn-secondary btn-sm w-100" @click="limparFiltro">
                  Limpar Filtro
                </button>
              </div>
            </div>
          </div>

          <div class="table-responsive">
            <table class="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Ano/Mês Ranking</th>
                  <th>Data Torneio</th>
                  <th>Tipo Torneio</th>
                  <th>Torneio do Ranking</th>
                  <th>Nº Entradas</th>
                  <th>Rake</th>
                  <th>Total Buy-ins</th>
                  <th>Total Rebuys</th>
                  <th>Total Add-ons</th>
                  <th>Total Premiação</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="torneio in torneiosList" :key="torneio.id">
                  <td>{{ torneio.id }}</td>
                  <td>{{ torneio.anoRanking }}/{{ torneio.mesRanking }}</td>
                  <td>{{ formatarData(torneio.dataTorneio) }}</td>
                  <td>{{ torneio.tipoTorneio?.diaSemana || '-' }}</td>
                  <td>{{ torneio.torneioDoRanking === 'SIM' ? 'SIM' : 'NÃO' }}</td>
                  <td>{{ torneio.numeroEntradas || 0 }}</td>
                  <td>{{ formatarMoeda(torneio.rake) }}</td>
                  <td>{{ torneio.totalBuyins}}</td>
                  <td>{{ torneio.totalRebuys}}</td>
                  <td>{{ torneio.totalAddons}}</td>
                  <td>{{ formatarMoeda(torneio.totalPremiacao) }}</td>
                  <td>
                    <button class="btn btn-info btn-sm mr-2" @click="editarTorneio(torneio)" title="Editar">
                      <i class="ti-pencil"></i>
                    </button>
                    <button class="btn btn-danger btn-sm" @click="excluirTorneio(torneio)" title="Excluir">
                      <i class="ti-trash"></i>
                    </button>
                  </td>
                </tr>
                <tr v-if="!torneiosList.length">
                  <td colspan="11" class="text-center">Nenhum torneio encontrado</td>
                </tr>
              </tbody>
            </table>

            <!-- Paginação -->
            <div v-if="totalItens > 0" class="d-flex justify-content-between align-items-center mt-4">
              <div class="text-muted">
                Mostrando {{ inicioContagem }} 
                a {{ fimContagem }} 
                de {{ totalItens }} torneios
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

    <!-- Modal de Torneio -->
    <tournament-modal
      :show="showModal"
      :torneio-edit="torneioSelecionado"
      @fechar="fecharModal"
      @salvar="salvarTorneio"
    />
  </div>
</template>

<script>
import Card from '@/components/Cards/Card.vue'
import TournamentModal from '@/components/Modals/TournamentModal.vue'
import axios from '@/config/axios'

export default {
  components: {
    Card,
    TournamentModal
  },
  data() {
    return {
      todosTorneios: [],
      torneios: [],
      carregando: true,
      erro: null,
      showModal: false,
      torneioSelecionado: null,
      paginaAtual: 1,
      itensPorPagina: 10,
      totalItens: 0,
      filtro: {
        campo: '',
        valor: ''
      }
    }
  },
  computed: {
    torneiosList() {
      return this.torneios || []
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
    torneiosFiltrados() {
      if (!this.filtro.campo || !this.filtro.valor) {
        return this.todosTorneios
      }

      const valorFiltro = this.filtro.valor.toString().toLowerCase()
      
      return this.todosTorneios.filter(torneio => {
        const valorCampo = torneio[this.filtro.campo]
        if (valorCampo === null || valorCampo === undefined) return false
        
        if (this.filtro.campo === 'id') {
          return valorCampo.toString() === valorFiltro
        }
        
        if (this.filtro.campo === 'status') {
          return valorCampo.toLowerCase() === valorFiltro
        }
        
        if (this.filtro.campo === 'data') {
          return this.formatarData(valorCampo).includes(valorFiltro)
        }

        if (this.filtro.campo === 'tipoTorneio') {
          return torneio.tipoTorneio?.diaSemana?.toLowerCase().includes(valorFiltro)
        }
        
        return valorCampo.toString().toLowerCase().includes(valorFiltro)
      })
    },
    obterPlaceholderFiltro() {
      const placeholders = {
        id: 'Digite o ID do torneio',
        data: 'Digite a data do torneio',
        tipoTorneio: 'Digite o dia da semana do tipo de torneio',
        status: 'Digite o status do torneio'
      }
      return this.filtro.campo ? placeholders[this.filtro.campo] : 'Selecione um campo para filtrar'
    }
  },
  watch: {
    'filtro.campo'() {
      this.paginaAtual = 1
      this.aplicarPaginacao()
    },
    'filtro.valor'() {
      this.paginaAtual = 1
      this.aplicarPaginacao()
    },
    torneiosFiltrados() {
      this.totalItens = this.torneiosFiltrados.length
      this.aplicarPaginacao()
    }
  },
  methods: {
    async carregarTorneios() {
      try {
        this.carregando = true
        this.erro = null
        const response = await axios.get('/torneio')
        
        if (response.data) {
          this.todosTorneios = Array.isArray(response.data) ? response.data : 
                           (response.data.content || response.data.data || [])
          
          this.totalItens = this.todosTorneios.length
          this.aplicarPaginacao()
        } else {
          throw new Error('Resposta vazia da API')
        }
      } catch (error) {
        console.error('Erro ao carregar torneios:', error)
        this.erro = `Erro ao carregar a lista de torneios: ${error.message}`
        this.todosTorneios = []
        this.torneios = []
        this.totalItens = 0
      } finally {
        this.carregando = false
      }
    },
    aplicarPaginacao() {
      const inicio = (this.paginaAtual - 1) * this.itensPorPagina
      const fim = inicio + this.itensPorPagina
      this.torneios = this.torneiosFiltrados.slice(inicio, fim)
    },
    mudarPagina(pagina) {
      if (pagina >= 1 && pagina <= this.totalPaginas && pagina !== this.paginaAtual) {
        this.paginaAtual = pagina
        this.aplicarPaginacao()
      }
    },
    abrirModalNovoTorneio() {
      this.torneioSelecionado = null
      this.showModal = true
    },
    editarTorneio(torneio) {
      this.torneioSelecionado = { ...torneio }
      this.showModal = true
    },
    fecharModal() {
      this.showModal = false
      this.torneioSelecionado = null
    },
    async salvarTorneio(torneio) {
      try {
        console.log('Dados a serem enviados:', torneio)
        
        if (torneio.id) {
          const response = await axios.put(`/torneio/${torneio.id}`, torneio)
          console.log('Resposta da API (PUT):', response.data)
          this.$notify({
            message: 'Torneio atualizado com sucesso!',
            type: 'success'
          })
        } else {
          const response = await axios.post('/torneio', torneio)
          console.log('Resposta da API (POST):', response.data)
          this.$notify({
            message: 'Torneio criado com sucesso!',
            type: 'success'
          })
        }
        await this.carregarTorneios()
      } catch (error) {
        console.error('Erro ao salvar torneio:', error)
        console.error('Detalhes do erro:', error.response?.data)
        
        let mensagemErro = 'Erro ao salvar torneio.'
        
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
    async excluirTorneio(torneio) {
      if (torneio && confirm(`Tem certeza que deseja excluir o torneio?`)) {
        try {
          await axios.delete(`/torneio/${torneio.id}`)
          await this.carregarTorneios()
          if (this.torneios.length === 0 && this.paginaAtual > 1) {
            this.paginaAtual--
            this.aplicarPaginacao()
          }
          this.$notify({
            message: 'Torneio excluído com sucesso!',
            type: 'success'
          })
        } catch (error) {
          console.error('Erro ao excluir torneio:', error)
          this.$notify({
            message: 'Erro ao excluir torneio. Por favor, tente novamente.',
            type: 'danger'
          })
        }
      }
    },
    limparFiltro() {
      this.filtro.campo = ''
      this.filtro.valor = ''
      this.paginaAtual = 1
      this.aplicarPaginacao()
    },
    formatarMoeda(valor) {
      if (valor === null || valor === undefined) return 'R$ 0,00'
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(valor)
    },
    formatarData(data) {
      if (!data) return '-'
      return new Date(data).toLocaleDateString('pt-BR')
    },
    getBadgeClass(status) {
      const classes = {
        'AGENDADO': 'badge-info',
        'EM_ANDAMENTO': 'badge-warning',
        'FINALIZADO': 'badge-success',
        'CANCELADO': 'badge-danger'
      }
      return classes[status] || 'badge-secondary'
    }
  },
  mounted() {
    this.carregarTorneios()
  }
}
</script>

<style>
.badge {
  padding: 0.4em 0.8em;
  font-size: 85%;
}
.badge-success {
  background-color: #51cbce;
}
.badge-danger {
  background-color: #ef8157;
}
.badge-warning {
  background-color: #fbc658;
}
.badge-info {
  background-color: #51bcda;
}
</style> 