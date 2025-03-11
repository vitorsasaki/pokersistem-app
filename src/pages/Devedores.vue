<template>
  <div>
    <div class="row">
      <div class="col-12">
        <card>
          <template slot="header">
            <div class="d-flex justify-content-between align-items-center">
              <h4 class="card-title">Devedores</h4>
              <button class="btn btn-primary btn-sm" @click="abrirModalNovoLancamento">
                <i class="ti-plus"></i> Novo Lançamento
              </button>
            </div>
          </template>
          
          <div v-if="carregando" class="text-center my-5">
            <i class="fa fa-spinner fa-spin fa-3x"></i>
            <p class="mt-2">Carregando devedores...</p>
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
                    <div class="d-flex align-items-center">
                      <select class="form-control" v-model="filtro.campo">
                        <option value="">Selecione um campo</option>
                        <option value="id">ID</option>
                        <option value="jogador">Jogador</option>
                        <option value="nomeReal">Nome Real</option>
                        <option value="valor">Valor</option>                    
                        <option value="dataUltimaAtualizacao">Última Atualização</option>
                      </select>
                      <div class="ml-2">
                        <div class="custom-control custom-checkbox">
                          <input 
                            type="checkbox" 
                            class="custom-control-input" 
                            id="mostrarApenasDevedores" 
                            v-model="mostrarApenasDevedores"
                          >
                          <label class="custom-control-label" for="mostrarApenasDevedores">
                            Apenas devedores
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="col-md-7">
                  <div class="form-group">
                    <label>{{ filtro.campo === 'dataUltimaAtualizacao' ? 'Período' : 'Valor do filtro' }}</label>
                    <div v-if="filtro.campo === 'dataUltimaAtualizacao'" class="row">
                      <div class="col-md-6">
                        <input
                          type="date"
                          class="form-control"
                          :value="getDataSemHora(filtro.dataInicial)"
                          @input="setDataInicial($event.target.value)"
                          placeholder="Data Inicial"
                        />
                      </div>
                      <div class="col-md-6">
                        <input
                          type="date"
                          class="form-control"
                          :value="getDataSemHora(filtro.dataFinal)"
                          @input="setDataFinal($event.target.value)"
                          placeholder="Data Final"
                        />
                      </div>
                    </div>
                    <input
                      v-else
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
                    <th>Jogador</th>
                    <th>Nome Real</th>
                    <th>Valor</th>                
                    <th>Última Atualização</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="devedor in devedoresList" :key="devedor.id">
                    <td>{{ devedor.id }}</td>
                    <td>{{ devedor.jogador?.nome || '-' }}</td>
                    <td>{{ devedor.jogador?.nomeReal || '-' }}</td>
                    <td>{{ formatarMoeda(devedor.valor) }}</td>                  
                    <td>{{ formatarDataHora(devedor.dataUltimaAtualizacao) }}</td>
                  </tr>
                  <tr v-if="!devedoresList.length">
                    <td colspan="5" class="text-center">Nenhum devedor encontrado</td>
                  </tr>
                </tbody>
              </table>

              <!-- Paginação -->
              <div v-if="totalItens > 0" class="d-flex justify-content-between align-items-center mt-4">
                <div class="text-muted">
                  Mostrando {{ inicioContagem }} 
                  a {{ fimContagem }} 
                  de {{ totalItens }} devedores
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

    <!-- Modal de Lançamento -->
    <lancamento-modal
      :show="showModal"
      :lancamento-edit="lancamentoSelecionado"
      @fechar="fecharModal"
      @salvar="salvarLancamento"
    />
  </div>
</template>

<script>
import Card from '@/components/Cards/Card.vue'
import axios from '@/config/axios'
import LancamentoModal from '@/components/Modals/LancamentoModal.vue'

export default {
  components: {
    Card,
    LancamentoModal
  },
  data() {
    return {
      todosDevedores: [],
      devedores: [],
      carregando: true,
      erro: null,
      paginaAtual: 1,
      itensPorPagina: 10,
      totalItens: 0,
      filtro: {
        campo: 'nomeReal',
        valor: '',
        dataInicial: '',
        dataFinal: ''
      },
      showModal: false,
      lancamentoSelecionado: null,
      mostrarApenasDevedores: false
    }
  },
  computed: {
    devedoresList() {
      return this.devedores || []
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
    devedoresFiltrados() {
      let resultado = this.todosDevedores

      // Primeiro aplica o filtro de devedores se estiver ativado
      if (this.mostrarApenasDevedores) {
        resultado = resultado.filter(devedor => devedor.valor > 0)
      }

      if (!this.filtro.campo) {
        return resultado
      }

      if (this.filtro.campo === 'dataUltimaAtualizacao') {
        if (!this.filtro.dataInicial && !this.filtro.dataFinal) {
          return resultado
        }

        return resultado.filter(devedor => {
          const dataAtualizacao = new Date(devedor.dataUltimaAtualizacao)
          const dataInicial = this.filtro.dataInicial ? new Date(this.filtro.dataInicial) : null
          const dataFinal = this.filtro.dataFinal ? new Date(this.filtro.dataFinal) : null

          if (dataInicial && dataFinal) {
            return dataAtualizacao >= dataInicial && dataAtualizacao <= dataFinal
          } else if (dataInicial) {
            return dataAtualizacao >= dataInicial
          } else if (dataFinal) {
            return dataAtualizacao <= dataFinal
          }
          return true
        })
      }

      if (!this.filtro.valor) {
        return resultado
      }

      const valorFiltro = this.filtro.valor.toString().toLowerCase()
      
      return resultado.filter(devedor => {
        if (this.filtro.campo === 'id') {
          return devedor.id.toString() === valorFiltro
        }
        
        if (this.filtro.campo === 'jogador') {
          return devedor.jogador?.nome?.toLowerCase().includes(valorFiltro)
        }

        if (this.filtro.campo === 'nomeReal') {
          return devedor.jogador?.nomeReal?.toLowerCase().includes(valorFiltro)
        }
        
        if (this.filtro.campo === 'valor') {
          return devedor.valor.toString().includes(valorFiltro)
        }
        
        const valorCampo = devedor[this.filtro.campo]
        if (valorCampo === null || valorCampo === undefined) return false
        
        return valorCampo.toString().toLowerCase().includes(valorFiltro)
      })
    },
    obterPlaceholderFiltro() {
      const placeholders = {
        id: 'Digite o ID',
        jogador: 'Digite o nome do jogador',
        nomeReal: 'Digite o nome real do jogador',
        valor: 'Digite o valor',
        dataUltimaAtualizacao: 'Digite a data (dd/mm/aaaa hh:mm:ss)'
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
    devedoresFiltrados() {
      this.totalItens = this.devedoresFiltrados.length
      this.aplicarPaginacao()
    }
  },
  methods: {
    async carregarDevedores() {
      try {
        this.carregando = true
        this.erro = null
        const response = await axios.get('/devedores')
        
        if (response.data) {
          this.todosDevedores = Array.isArray(response.data) ? response.data : 
                           (response.data.content || response.data.data || [])
          
          this.totalItens = this.todosDevedores.length
          this.aplicarPaginacao()
        } else {
          throw new Error('Resposta vazia da API')
        }
      } catch (error) {
        console.error('Erro ao carregar devedores:', error)
        this.erro = `Erro ao carregar a lista de devedores: ${error.message}`
        this.todosDevedores = []
        this.devedores = []
        this.totalItens = 0
      } finally {
        this.carregando = false
      }
    },
    aplicarPaginacao() {
      const inicio = (this.paginaAtual - 1) * this.itensPorPagina
      const fim = inicio + this.itensPorPagina
      this.devedores = this.devedoresFiltrados.slice(inicio, fim)
    },
    mudarPagina(pagina) {
      if (pagina >= 1 && pagina <= this.totalPaginas && pagina !== this.paginaAtual) {
        this.paginaAtual = pagina
        this.aplicarPaginacao()
      }
    },
    limparFiltro() {
      this.filtro.campo = ''
      this.filtro.valor = ''
      this.filtro.dataInicial = ''
      this.filtro.dataFinal = ''
      this.mostrarApenasDevedores = false
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
    formatarDataHora(data) {
      if (!data) return '-'
      const dataObj = new Date(data)
      return `${dataObj.toLocaleDateString('pt-BR')} ${dataObj.toLocaleTimeString('pt-BR')}`
    },
    abrirModalNovoLancamento() {
      this.lancamentoSelecionado = null
      this.showModal = true
    },
    fecharModal() {
      this.showModal = false
      this.lancamentoSelecionado = null
    },
    async salvarLancamento(lancamento) {
      try {
        console.log('Dados a serem enviados:', lancamento)
        
        const response = await axios.post('/lancamentoDevedor', lancamento)
        console.log('Resposta da API (POST):', response.data)
        this.$notify({
          message: 'Lançamento criado com sucesso!',
          type: 'success'
        })
        
        await this.carregarDevedores()
      } catch (error) {
        console.error('Erro ao salvar lançamento:', error)
        console.error('Detalhes do erro:', error.response?.data)
        
        let mensagemErro = 'Erro ao salvar lançamento.'
        
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
    getDataSemHora(data) {
      if (!data) return ''
      return data.split('T')[0]
    },
    setDataInicial(data) {
      if (!data) {
        this.filtro.dataInicial = ''
        return
      }
      const dataComHora = new Date(data)
      dataComHora.setHours(0, 1, 0)
      this.filtro.dataInicial = dataComHora.toISOString().slice(0, 16)
      this.aplicarPaginacao()
    },
    setDataFinal(data) {
      if (!data) {
        this.filtro.dataFinal = ''
        return
      }
      const dataComHora = new Date(data)
      dataComHora.setHours(23, 59, 0)
      this.filtro.dataFinal = dataComHora.toISOString().slice(0, 16)
      this.aplicarPaginacao()
    }
  },
  mounted() {
    this.carregarDevedores()
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