<template>
  <div class="row">
    <div class="col-12">
      <card>
        <template slot="header">
          <div class="d-flex justify-content-between align-items-center">
            <h4 class="card-title">Jogadores</h4>
            <button class="btn btn-primary btn-sm" @click="abrirModalNovoJogador">
              <i class="ti-plus"></i> Novo Jogador
            </button>
          </div>
        </template>
        
        <div v-if="carregando" class="text-center my-5">
          <i class="fa fa-spinner fa-spin fa-3x"></i>
          <p class="mt-2">Carregando jogadores...</p>
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
                    <option value="nomeReal">Nome Real</option>
                    <option value="estado">Estado</option>
                    <option value="idpp">IDPP</option>
                    <option value="login">Login</option>
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
                  <th>Nome</th>
                  <th>Nome Real</th>
                  <th>Estado</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="jogador in jogadoresList" :key="jogador.id">
                  <td>{{ jogador.id }}</td>
                  <td>{{ jogador.nome }}</td>
                  <td>{{ jogador.nomeReal }}</td>
                  <td>{{ jogador.estado }}</td>
                  <td>
                    <button class="btn btn-info btn-sm mr-2" @click="editarJogador(jogador)">
                      <i class="ti-pencil"></i>
                    </button>
                    <button class="btn btn-danger btn-sm" @click="excluirJogador(jogador)">
                      <i class="ti-trash"></i>
                    </button>
                  </td>
                </tr>
                <tr v-if="!jogadoresList.length">
                  <td colspan="5" class="text-center">Nenhum jogador encontrado</td>
                </tr>
              </tbody>
            </table>

            <!-- Paginação -->
            <div v-if="totalItens > 0" class="d-flex justify-content-between align-items-center mt-4">
              <div class="text-muted">
                Mostrando {{ inicioContagem }} 
                a {{ fimContagem }} 
                de {{ totalItens }} jogadores
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

    <!-- Modal de Jogador -->
    <player-modal
      :show="showModal"
      :jogador-edit="jogadorSelecionado"
      @fechar="fecharModal"
      @salvar="salvarJogador"
    />
  </div>
</template>

<script>
import Card from '@/components/Cards/Card.vue'
import PlayerModal from '@/components/Modals/PlayerModal.vue'
import axios from 'axios'

export default {
  components: {
    Card,
    PlayerModal
  },
  data() {
    return {
      todosJogadores: [], // Array com todos os jogadores
      jogadores: [], // Array com jogadores da página atual
      carregando: true,
      erro: null,
      showModal: false,
      jogadorSelecionado: null,
      // Dados da paginação
      paginaAtual: 1,
      itensPorPagina: 10,
      totalItens: 0,
      // Adiciona configuração do filtro
      filtro: {
        campo: '',
        valor: ''
      }
    }
  },
  computed: {
    jogadoresList() {
      return this.jogadores || []
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

      // Ajusta para sempre mostrar 5 páginas quando possível
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
    jogadoresFiltrados() {
      if (!this.filtro.campo || !this.filtro.valor) {
        return this.todosJogadores
      }

      const valorFiltro = this.filtro.valor.toString().toLowerCase()
      
      return this.todosJogadores.filter(jogador => {
        const valorCampo = jogador[this.filtro.campo]
        if (valorCampo === null || valorCampo === undefined) return false
        
        // Para ID e IDPP, faz uma comparação exata
        if (this.filtro.campo === 'id' || this.filtro.campo === 'idpp') {
          return valorCampo.toString() === valorFiltro
        }
        
        // Para estado, faz uma comparação exata case-sensitive
        if (this.filtro.campo === 'estado') {
          return valorCampo === this.filtro.valor
        }
        
        // Para os demais campos, faz uma busca parcial case-insensitive
        return valorCampo.toString().toLowerCase().includes(valorFiltro)
      })
    },
    obterPlaceholderFiltro() {
      const placeholders = {
        id: 'Digite o ID do jogador',
        nome: 'Digite o nome do jogador',
        nomeReal: 'Digite o nome real do jogador',
        estado: 'Digite a sigla do estado (ex: SP)',
        idpp: 'Digite o IDPP do jogador',
        login: 'Digite o login do jogador'
      }
      return this.filtro.campo ? placeholders[this.filtro.campo] : 'Selecione um campo para filtrar'
    }
  },
  watch: {
    // Observa mudanças no filtro para atualizar a paginação
    'filtro.campo'() {
      this.paginaAtual = 1
      this.aplicarPaginacao()
    },
    'filtro.valor'() {
      this.paginaAtual = 1
      this.aplicarPaginacao()
    },
    jogadoresFiltrados() {
      this.totalItens = this.jogadoresFiltrados.length
      this.aplicarPaginacao()
    }
  },
  methods: {
    async carregarJogadores() {
      try {
        this.carregando = true
        this.erro = null
        const response = await axios.get('/pokersistem/jogadores')
        
        if (response.data) {
          this.todosJogadores = Array.isArray(response.data) ? response.data : 
                           (response.data.content || response.data.data || [])
          
          this.totalItens = this.todosJogadores.length
          this.aplicarPaginacao()
        } else {
          throw new Error('Resposta vazia da API')
        }
      } catch (error) {
        console.error('Erro ao carregar jogadores:', error)
        this.erro = `Erro ao carregar a lista de jogadores: ${error.message}`
        this.todosJogadores = []
        this.jogadores = []
        this.totalItens = 0
      } finally {
        this.carregando = false
      }
    },
    aplicarPaginacao() {
      const inicio = (this.paginaAtual - 1) * this.itensPorPagina
      const fim = inicio + this.itensPorPagina
      this.jogadores = this.jogadoresFiltrados.slice(inicio, fim)
    },
    mudarPagina(pagina) {
      if (pagina >= 1 && pagina <= this.totalPaginas && pagina !== this.paginaAtual) {
        this.paginaAtual = pagina
        this.aplicarPaginacao()
      }
    },
    abrirModalNovoJogador() {
      this.jogadorSelecionado = null
      this.showModal = true
    },
    editarJogador(jogador) {
      this.jogadorSelecionado = { ...jogador }
      this.showModal = true
    },
    fecharModal() {
      this.showModal = false
      this.jogadorSelecionado = null
    },
    async salvarJogador(jogador) {
      try {
        console.log('Dados a serem enviados:', jogador)
        
        if (jogador.id) {
          const response = await axios.put(`/pokersistem/jogadores/${jogador.id}`, jogador)
          console.log('Resposta da API (PUT):', response.data)
          this.$notify({
            message: 'Jogador atualizado com sucesso!',
            type: 'success'
          })
        } else {
          const response = await axios.post('/pokersistem/jogadores', jogador)
          console.log('Resposta da API (POST):', response.data)
          this.$notify({
            message: 'Jogador criado com sucesso!',
            type: 'success'
          })
        }
        await this.carregarJogadores()
      } catch (error) {
        console.error('Erro ao salvar jogador:', error)
        this.$notify({
          message: 'Erro ao salvar jogador. Por favor, tente novamente.',
          type: 'danger'
        })
      }
    },
    async excluirJogador(jogador) {
      if (jogador && confirm(`Tem certeza que deseja excluir o jogador ${jogador.nome}?`)) {
        try {
          await axios.delete(`/pokersistem/jogadores/${jogador.id}`)
          await this.carregarJogadores()
          if (this.jogadores.length === 0 && this.paginaAtual > 1) {
            this.paginaAtual--
            this.aplicarPaginacao()
          }
          this.$notify({
            message: 'Jogador excluído com sucesso!',
            type: 'success'
          })
        } catch (error) {
          console.error('Erro ao excluir jogador:', error)
          this.$notify({
            message: 'Erro ao excluir jogador. Por favor, tente novamente.',
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
    }
  },
  mounted() {
    this.carregarJogadores()
  }
}
</script>

<style>
.btn-sm {
  padding: 5px 10px;
  font-size: 12px;
}
.mr-2 {
  margin-right: 8px;
}
.pagination {
  margin: 0;
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
.card-body {
  padding: 1.25rem;
}
.pb-0 {
  padding-bottom: 0 !important;
}
</style> 