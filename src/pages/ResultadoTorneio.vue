<template>
  <div>
    <div class="row">
      <div class="col-12">
        <card>
          <template slot="header">
            <div class="d-flex justify-content-between align-items-center">
              <h4 class="card-title">Resultados do Torneio</h4>
              <button class="btn btn-primary btn-sm" @click="abrirModalNovoResultado">
                <i class="ti-plus"></i> Novo Resultado
              </button>
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

            <div class="table-responsive">
              <table class="table">
                <thead>
                  <tr>
                    <th>Posição</th>
                    <th>Jogador</th>
                    <th>Torneio ID</th>
                    <th>Mês/Ano</th>                    
                    <th>Total de Pontos</th>
                    <th>Ponto Bônus</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="resultado in resultadosList" :key="resultado.id">
                    <td>{{ resultado.posicao }}</td>
                    <td>{{ resultado.jogador?.nomeReal || '-' }}</td>
                    <td>{{ resultado.torneio?.id || '-' }}</td>
                    <td>{{ formatarMesAno(resultado.torneio?.mesRanking, resultado.torneio?.anoRanking) }}</td>                    
                    <td>{{ resultado.totalPontosGanho }}</td>
                    <td>{{ resultado.pontoBonus === 'SIM' ? 'Sim' : 'Não' }}</td>
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
  </div>
</template>

<script>
import Card from '@/components/Cards/Card.vue'
import axios from '@/config/axios'
import ResultadoTorneioModal from '@/components/Modals/ResultadoTorneioModal.vue'

export default {
  components: {
    Card,
    ResultadoTorneioModal
  },
  data() {
    return {
      todosResultados: [],
      resultados: [],
      jogadores: [],
      carregando: true,
      erro: null,
      paginaAtual: 1,
      itensPorPagina: 10,
      totalItens: 0,
      filtro: {
        campo: 'jogador',
        valor: ''
      },
      showModal: false,
      resultadoSelecionado: null
    }
  },
  computed: {
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
    resultadosFiltrados() {
      let resultado = this.todosResultados

      if (!this.filtro.campo || !this.filtro.valor) {
        return resultado
      }

      const valorFiltro = this.filtro.valor.toString().toLowerCase()
      
      return resultado.filter(resultado => {
        if (this.filtro.campo === 'jogador') {
          return resultado.jogador?.nomeReal?.toLowerCase().includes(valorFiltro)
        }
        
        if (this.filtro.campo === 'torneio') {
          return resultado.torneio?.toLowerCase().includes(valorFiltro)
        }

        if (this.filtro.campo === 'posicao') {
          return resultado.posicao.toString() === valorFiltro
        }

        if (this.filtro.campo === 'totalPontosGanho') {
          return resultado.totalPontosGanho.toString().includes(valorFiltro)
        }
        
        const valorCampo = resultado[this.filtro.campo]
        if (valorCampo === null || valorCampo === undefined) return false
        
        return valorCampo.toString().toLowerCase().includes(valorFiltro)
      })
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
    'filtro.campo'() {
      this.paginaAtual = 1
      this.aplicarPaginacao()
    },
    'filtro.valor'() {
      this.paginaAtual = 1
      this.aplicarPaginacao()
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
    limparFiltro() {
      this.filtro.campo = ''
      this.filtro.valor = ''
      this.paginaAtual = 1
      this.aplicarPaginacao()
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
      const nomesMeses = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
      ]
      return `${nomesMeses[parseInt(mes) - 1]}/${ano}`
    }
  },
  async mounted() {
    await Promise.all([
      this.carregarResultados(),
      this.carregarJogadores()
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
</style> 