<template>
  <modal :show="show" @close="fecharModal">
    <template slot="header">
      <h4 class="modal-title">
        {{ lancamentoEdit ? 'Editar' : 'Novo' }} Lançamento
      </h4>
    </template>

    <template slot="body">
      <form @submit.prevent="salvar">
        <div class="row">
          <!-- Jogador -->
          <div class="col-md-12">
            <div class="form-group">
              <label>Jogador</label>
              <v-select
                v-model="lancamento.jogador"
                :options="jogadores"
                :reduce="jogador => jogador"
                label="nome"
                :get-option-label="getJogadorLabel"
                placeholder="Digite para buscar jogador..."
                class="vue-select-custom"
              />
            </div>
          </div>

          <!-- Tipo de Lançamento -->
          <div class="col-md-6">
            <div class="form-group">
              <label>Tipo de Lançamento</label>
              <select class="form-control" v-model="lancamento.tipoLancamento" required>
                <option value="">Selecione o tipo</option>
                <option value="DEVE">Deve</option>
                <option value="ABATER">Abater</option>
              </select>
            </div>
          </div>

          <!-- Valor -->
          <div class="col-md-6">
            <div class="form-group">
              <label>Valor</label>
              <input
                type="number"
                class="form-control"
                v-model.number="lancamento.valor"
                step="0.01"
                min="0"
                required
              />
            </div>
          </div>

          <!-- Data -->
          <div class="col-md-12">
            <div class="form-group">
              <label>Data</label>
              <input
                type="datetime-local"
                class="form-control"
                v-model="lancamento.data"
                required
              />
            </div>
          </div>
        </div>
      </form>
    </template>

    <template slot="footer">
      <button type="button" class="btn btn-secondary" @click="fecharModal">
        Cancelar
      </button>
      <button type="button" class="btn btn-primary" @click="salvar">
        {{ lancamentoEdit ? 'Atualizar' : 'Criar' }}
      </button>
    </template>
  </modal>
</template>

<script>
import Modal from '../Modal.vue'
import axios from '@/config/axios'
import vSelect from 'vue-select'
import 'vue-select/dist/vue-select.css'

export default {
  components: {
    Modal,
    vSelect
  },
  props: {
    show: {
      type: Boolean,
      default: false
    },
    lancamentoEdit: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      lancamento: {
        jogador: null,
        tipoLancamento: '',
        valor: 0,
        data: this.formatarDataParaInput(new Date())
      },
      jogadores: []
    }
  },
  computed: {
    jogadoresFiltrados() {
      if (!this.filtroJogador) return this.jogadores

      const termoBusca = this.filtroJogador.toLowerCase()
      return this.jogadores.filter(jogador => {
        const idMatch = jogador.id.toString().includes(termoBusca)
        const nomeMatch = jogador.nome.toLowerCase().includes(termoBusca)
        const nomeRealMatch = jogador.nomeReal.toLowerCase().includes(termoBusca)
        return idMatch || nomeMatch || nomeRealMatch
      })
    }
  },
  watch: {
    lancamentoEdit(novoValor) {
      if (novoValor) {
        this.lancamento = {
          ...novoValor,
          data: this.formatarDataParaInput(new Date(novoValor.data))
        }
      } else {
        this.limparFormulario()
      }
    },
    show(novoValor) {
      if (novoValor) {
        this.carregarJogadores()
      }
    }
  },
  methods: {
    getJogadorLabel(jogador) {
      return `#${jogador.id} - ${jogador.nome} (${jogador.nomeReal})`
    },
    async carregarJogadores() {
      try {
        const response = await axios.get('/jogadores')
        if (response.data) {
          this.jogadores = Array.isArray(response.data) ? response.data : 
                          (response.data.content || response.data.data || [])
        }
      } catch (error) {
        console.error('Erro ao carregar jogadores:', error)
        this.$notify({
          message: 'Erro ao carregar jogadores. Por favor, tente novamente.',
          type: 'danger'
        })
      }
    },
    formatarDataParaInput(data) {
      const dataLocal = new Date(data)
      const ano = dataLocal.getFullYear()
      const mes = String(dataLocal.getMonth() + 1).padStart(2, '0')
      const dia = String(dataLocal.getDate()).padStart(2, '0')
      const hora = String(dataLocal.getHours()).padStart(2, '0')
      const minuto = String(dataLocal.getMinutes()).padStart(2, '0')
      
      return `${ano}-${mes}-${dia}T${hora}:${minuto}`
    },
    limparFormulario() {
      this.lancamento = {
        jogador: null,
        tipoLancamento: '',
        valor: 0,
        data: this.formatarDataParaInput(new Date())
      }
    },
    fecharModal() {
      this.limparFormulario()
      this.$emit('fechar')
    },
    salvar() {
      const lancamentoParaSalvar = {
        ...this.lancamento,
        valor: Number(this.lancamento.valor),
        data: new Date(this.lancamento.data).toISOString()
      }

      this.$emit('salvar', lancamentoParaSalvar)
      this.fecharModal()
    }
  }
}
</script>

<style>
.form-group {
  margin-bottom: 1rem;
}

/* Estilos personalizados para o v-select */
.vue-select-custom {
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

.v-select .vs__clear {
  fill: #999;
}
</style> 