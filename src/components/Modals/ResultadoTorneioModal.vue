<template>
  <modal :show="show" @close="fechar">
    <template slot="header">
      <h4 class="modal-title">
        {{ resultadoEdit ? 'Editar Resultado' : 'Novo Resultado' }}
      </h4>
    </template>

    <template slot="body">
      <form @submit.prevent="salvar">
        <div class="form-group">
          <label>Jogador</label>
          <v-select
            v-model="resultado.jogador"
            :options="jogadores"
            :reduce="jogador => jogador"
            label="nome"
            :get-option-label="getJogadorLabel"
            placeholder="Digite para buscar jogador..."
            class="vue-select-custom"
          />
        </div>

        <div class="form-group">
          <label>Torneio</label>
          <v-select
            v-model="resultado.torneio"
            :options="torneios"
            :get-option-label="(option) => `ID: ${option.id} - ${formatarMesAno(option.mesRanking, option.anoRanking)}`"            
          />
        </div>

        <div class="form-group">
          <label>Posição</label>
          <input
            type="number"
            class="form-control"
            v-model.number="resultado.posicao"
            placeholder="Posição no torneio"
            min="1"
            required
          />
        </div>

        <div class="form-group">
          <div class="custom-control custom-checkbox">
            <input 
              type="checkbox" 
              class="custom-control-input" 
              id="pontoBonus"
              v-model="resultado.pontoBonus"
            >
            <label class="custom-control-label" for="pontoBonus">
              Ponto Bônus
            </label>
          </div>
        </div>

      </form>
    </template>

    <template slot="footer">
      <button type="button" class="btn btn-secondary" @click="fechar">
        Cancelar
      </button>
      <button type="button" class="btn btn-primary" @click="salvar" :disabled="!formValido">
        {{ resultadoEdit ? 'Atualizar' : 'Salvar' }}
      </button>
    </template>
  </modal>
</template>

<script>
import Modal from '@/components/Modal.vue'
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
    resultadoEdit: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      resultado: {
        jogador: null,
        torneio: null,
        posicao: null,
        pontoBonus: false
      },
      jogadores: [],
      torneios: []
    }
  },
  computed: {
    formValido() {
      return this.resultado.jogador &&
             this.resultado.torneio &&
             this.resultado.posicao &&
             this.resultado.posicao > 0
    }
  },
  watch: {
    show: {
      immediate: true,
      async handler(novoValor) {
        if (novoValor) {
          if (this.resultadoEdit) {
            this.resultado = { ...this.resultadoEdit }
          } else {
            this.limparFormulario()
          }

          await Promise.all([
            this.carregarJogadores(),
            this.carregarTorneios()
          ])
          
          // Se não estiver editando um resultado existente, seleciona o último torneio
          if (!this.resultadoEdit && this.torneios.length > 0) {
            this.resultado.torneio = this.torneios[0]
          }
        }
      }
    }
  },
  methods: {
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
        
        // Ordena os torneios pelo ID em ordem decrescente
        this.torneios.sort((a, b) => b.id - a.id)
        console.log('Torneios carregados:', this.torneios)
      } catch (error) {
        console.error('Erro ao carregar torneios:', error)
        this.torneios = []
      }
    },
    formatarMesAno(mes, ano) {
      if (!mes || !ano) return '-'
      const nomesMeses = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
      ]
      return `${nomesMeses[parseInt(mes) - 1]}/${ano}`
    },
    limparFormulario() {
      this.resultado = {
        jogador: null,
        torneio: null,
        posicao: null,
        pontoBonus: false
      }
    },
    fechar() {
      this.limparFormulario()
      this.$emit('fechar')
    },
    salvar() {
      if (this.formValido) {
        const resultadoParaSalvar = {
          jogador: this.resultado.jogador,
          torneio: this.resultado.torneio,
          posicao: this.resultado.posicao,
          pontoBonus: this.resultado.pontoBonus ? 'SIM' : 'NAO'
        }

        // Se estiver editando, inclui o ID
        if (this.resultadoEdit) {
          resultadoParaSalvar.id = this.resultadoEdit.id
        }

        console.log('Dados a serem enviados:', resultadoParaSalvar)
        this.$emit('salvar', resultadoParaSalvar)
        this.fechar()
      }
    },
    getJogadorLabel(jogador) {
      return `ID: ${jogador.id} - ${jogador.nome} (${jogador.nomeReal})`
    }
  }
}
</script>

<style>
.modal-body {
  padding: 20px;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
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

/* Estilos adicionais para garantir visibilidade do modal */
.modal {
  display: block;
  background-color: rgba(0, 0, 0, 0.5);
}

.modal-dialog {
  margin: 1.75rem auto;
}

.modal-content {
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.modal-header,
.modal-footer {
  padding: 1rem;
}
</style> 