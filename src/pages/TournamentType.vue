<template>
  <div class="row">
    <div class="col-12">
      <card>
        <template slot="header">
          <div class="d-flex justify-content-between align-items-center">
            <h4 class="card-title">Tipos de Torneio</h4>
            <button class="btn btn-primary btn-sm" @click="abrirModalNovoTipoTorneio">
              <i class="ti-plus"></i> Novo Tipo de Torneio
            </button>
          </div>
        </template>
        
        <div v-if="carregando" class="text-center my-5">
          <i class="fa fa-spinner fa-spin fa-3x"></i>
          <p class="mt-2">Carregando tipos de torneio...</p>
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
                    <option value="nome">Nome</option>
                    <option value="descricao">Descrição</option>
                    <option value="diaSemana">Dia da Semana</option>
                    <option value="valor">Valor</option>
                    <option value="status">Status</option>
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
                  <th>Dia Semana</th>
                  <th>Stack Inicial</th>
                  <th>Stack Rebuy</th>
                  <th>Stack Addon</th>
                  <th>Valor</th>
                  <th>Valor Rebuy</th>
                  <th>Valor Addon</th>
                  <th>Reg. Tardio (min)</th>                  
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="tipo in tiposList" :key="tipo.id">
                  <td>{{ tipo.id }}</td>                  
                  <td>{{ tipo.diaSemana }}</td>
                  <td>{{ tipo.stackInicial }}</td>
                  <td>{{ tipo.stackRebuy }}</td>
                  <td>{{ tipo.stackAddon }}</td>
                  <td>{{ formatarMoeda(tipo.valor) }}</td>
                  <td>{{ formatarMoeda(tipo.valorRebuy) }}</td>
                  <td>{{ formatarMoeda(tipo.valorAddon) }}</td>
                  <td>{{ tipo.registroTardio }}</td>                  
                  <td>
                    <button class="btn btn-info btn-sm mr-2" @click="editarTipoTorneio(tipo)" title="Editar">
                      <i class="ti-pencil"></i>
                    </button>
                    <button class="btn btn-danger btn-sm" @click="excluirTipoTorneio(tipo)" title="Excluir">
                      <i class="ti-trash"></i>
                    </button>
                  </td>
                </tr>
                <tr v-if="!tiposList.length">
                  <td colspan="6" class="text-center">Nenhum tipo de torneio encontrado</td>
                </tr>
              </tbody>
            </table>

            <!-- Paginação -->
            <div v-if="totalItens > 0" class="d-flex justify-content-between align-items-center mt-4">
              <div class="text-muted">
                Mostrando {{ inicioContagem }} 
                a {{ fimContagem }} 
                de {{ totalItens }} tipos de torneio
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

    <!-- Modal de Tipo de Torneio -->
    <tournament-type-modal
      :show="showModal"
      :tipo-torneio-edit="tipoTorneioSelecionado"
      @fechar="fecharModal"
      @salvar="salvarTipoTorneio"
    />
  </div>
</template>

<script>
import Card from '@/components/Cards/Card.vue'
import TournamentTypeModal from '@/components/Modals/TournamentTypeModal.vue'
import axios from '@/config/axios'

export default {
  components: {
    Card,
    TournamentTypeModal
  },
  data() {
    return {
      todosTipos: [],
      tipos: [],
      carregando: true,
      erro: null,
      showModal: false,
      tipoTorneioSelecionado: null,
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
    tiposList() {
      return this.tipos || []
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
    tiposFiltrados() {
      if (!this.filtro.campo || !this.filtro.valor) {
        return this.todosTipos
      }

      const valorFiltro = this.filtro.valor.toString().toLowerCase()
      
      return this.todosTipos.filter(tipo => {
        const valorCampo = tipo[this.filtro.campo]
        if (valorCampo === null || valorCampo === undefined) return false
        
        if (this.filtro.campo === 'id') {
          return valorCampo.toString() === valorFiltro
        }
        
        if (this.filtro.campo === 'status') {
          return valorCampo.toLowerCase() === valorFiltro
        }
        
        return valorCampo.toString().toLowerCase().includes(valorFiltro)
      })
    },
    obterPlaceholderFiltro() {
      const placeholders = {
        id: 'Digite o ID do tipo de torneio',
        nome: 'Digite o nome do tipo de torneio',
        descricao: 'Digite parte da descrição',
        diaSemana: 'Digite o dia da semana',
        valor: 'Digite o valor do torneio',
        status: 'Digite ATIVO ou INATIVO'
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
    tiposFiltrados() {
      this.totalItens = this.tiposFiltrados.length
      this.aplicarPaginacao()
    }
  },
  methods: {
    async carregarTiposTorneio() {
      try {
        this.carregando = true
        this.erro = null
        const response = await axios.get('/tipoTorneio')
        
        if (response.data) {
          this.todosTipos = Array.isArray(response.data) ? response.data : 
                           (response.data.content || response.data.data || [])
          
          this.totalItens = this.todosTipos.length
          this.aplicarPaginacao()
        } else {
          throw new Error('Resposta vazia da API')
        }
      } catch (error) {
        console.error('Erro ao carregar tipos de torneio:', error)
        this.erro = `Erro ao carregar a lista de tipos de torneio: ${error.message}`
        this.todosTipos = []
        this.tipos = []
        this.totalItens = 0
      } finally {
        this.carregando = false
      }
    },
    aplicarPaginacao() {
      const inicio = (this.paginaAtual - 1) * this.itensPorPagina
      const fim = inicio + this.itensPorPagina
      this.tipos = this.tiposFiltrados.slice(inicio, fim)
    },
    mudarPagina(pagina) {
      if (pagina >= 1 && pagina <= this.totalPaginas && pagina !== this.paginaAtual) {
        this.paginaAtual = pagina
        this.aplicarPaginacao()
      }
    },
    abrirModalNovoTipoTorneio() {
      this.tipoTorneioSelecionado = null
      this.showModal = true
    },
    editarTipoTorneio(tipo) {
      this.tipoTorneioSelecionado = { ...tipo }
      this.showModal = true
    },
    fecharModal() {
      this.showModal = false
      this.tipoTorneioSelecionado = null
    },
    async salvarTipoTorneio(tipo) {
      try {
        if (tipo.id) {
          await axios.put(`/tipoTorneio/${tipo.id}`, tipo)
          this.$notify({
            message: 'Tipo de torneio atualizado com sucesso!',
            type: 'success'
          })
        } else {
          await axios.post('/tipoTorneio', tipo)
          this.$notify({
            message: 'Tipo de torneio criado com sucesso!',
            type: 'success'
          })
        }
        await this.carregarTiposTorneio()
      } catch (error) {
        console.error('Erro ao salvar tipo de torneio:', error)
        this.$notify({
          message: 'Erro ao salvar tipo de torneio. Por favor, tente novamente.',
          type: 'danger'
        })
      }
    },
    async excluirTipoTorneio(tipo) {
      if (tipo && confirm(`Tem certeza que deseja excluir o tipo de torneio ${tipo.nome}?`)) {
        try {
          await axios.delete(`/tipoTorneio/${tipo.id}`)
          await this.carregarTiposTorneio()
          if (this.tipos.length === 0 && this.paginaAtual > 1) {
            this.paginaAtual--
            this.aplicarPaginacao()
          }
          this.$notify({
            message: 'Tipo de torneio excluído com sucesso!',
            type: 'success'
          })
        } catch (error) {
          console.error('Erro ao excluir tipo de torneio:', error)
          this.$notify({
            message: 'Erro ao excluir tipo de torneio. Por favor, tente novamente.',
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
    }
  },
  mounted() {
    this.carregarTiposTorneio()
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
</style> 