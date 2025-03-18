<template>
  <modal :show="show" @close="fechar" >
    <template slot="header">
      <h4 class="modal-title">Lista de Resultados</h4>
    </template>

    <template slot="body">
      <form @submit.prevent="adicionarResultado" ref="form">
        <div class="row">
          <div class="col-md-6">
            <div class="form-group">
              <label>Torneio</label>
              <v-select
                v-model="torneioSelecionado"
                :options="torneios"
                :get-option-label="(option) => `ID: ${option.id} - ${formatarMesAno(option.mesRanking, option.anoRanking)}`"
                placeholder="Selecione um torneio"
                :disabled="listaResultados.length > 0"
              />
            </div>
          </div>
        </div>

        <div class="row">
          <div class="col-md-6">
            <div class="form-group">
              <label>Jogador</label>
              <v-select
                ref="jogadorSelect"
                v-model="resultado.jogador"
                :options="jogadores"
                :reduce="jogador => jogador"
                label="nome"
                :get-option-label="getJogadorLabel"
                placeholder="Digite para buscar jogador..."
                class="vue-select-custom"
                tabindex="1"
              />
            </div>
          </div>
          <div class="col-md-3">
            <div class="form-group">
              <label>Posição</label>
              <input
                type="number"
                class="form-control"
                v-model.number="resultado.posicao"
                placeholder="Posição"
                min="1"
                tabindex="3"
              />
            </div>
          </div>
          <div class="col-md-3">
            <div class="form-group">
              <label>&nbsp;</label>
              <div class="custom-control custom-checkbox mt-2">
                <input 
                  type="checkbox" 
                  class="custom-control-input" 
                  id="pontoBonus"
                  v-model="resultado.pontoBonus"
                  tabindex="4"
                >
                <label class="custom-control-label" for="pontoBonus">
                  Ponto Bônus
                </label>
              </div>
            </div>
          </div>
        </div>

        <div class="row">
          <div class="col-12">
            <button 
              type="submit" 
              class="btn btn-info btn-sm"
              :disabled="!formValido"
              tabindex="2"
              ref="btnAdicionar"
            >
              Adicionar à Lista
            </button>
          </div>
        </div>
      </form>

      <div class="mt-4">
        <h5>Lista de Resultados ({{ listaResultados.length }})</h5>
        <div class="table-container">
          <table class="table">
            <thead>
              <tr>
                <th>Posição</th>
                <th>Jogador</th>
                <th>Ponto Bônus</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in listaResultados" :key="index">
                <td>{{ item.posicao }}</td>
                <td>{{ item.jogador.nome }}</td>
                <td>
                  <div class="custom-control custom-switch">
                    <input
                      type="checkbox"
                      class="custom-control-input"
                      :id="'pontoBonus' + index"
                      v-model="item.pontoBonus"
                      @change="togglePontoBonus(index)"
                    >
                    <label class="custom-control-label" :for="'pontoBonus' + index">
                      {{ item.pontoBonus === 'SIM' ? 'Sim' : 'Não' }}
                    </label>
                  </div>
                </td>
                <td>
                  <button 
                    class="btn btn-danger btn-sm" 
                    @click="removerDaLista(index)"
                    title="Remover"
                  >
                    <i class="ti-trash"></i>
                  </button>
                </td>
              </tr>
              <tr v-if="!listaResultados.length">
                <td colspan="4" class="text-center">Nenhum resultado adicionado</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>

    <template slot="footer">
      <button type="button" class="btn btn-secondary" @click="fechar">
        Cancelar
      </button>
      <button 
        type="button" 
        class="btn btn-primary" 
        @click="salvarLista"
        :disabled="!listaResultados.length || !torneioSelecionado"
      >
        Salvar Lista
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
    }
  },
  data() {
    return {
      jogadores: [],
      torneios: [],
      torneioSelecionado: null,
      resultado: {
        jogador: null,
        posicao: null,
        pontoBonus: false
      },
      listaResultados: []
    }
  },
  computed: {
    formValido() {
      return this.resultado.jogador &&
             this.resultado.posicao &&
             this.resultado.posicao > 0 &&
             this.torneioSelecionado &&
             !this.jogadorJaAdicionado
    },
    jogadorJaAdicionado() {
      return this.listaResultados.some(r => r.jogador.id === this.resultado.jogador?.id)
    },
    proximaPosicao() {
      if (!this.listaResultados.length) return 1
      const maiorPosicao = Math.max(...this.listaResultados.map(r => r.posicao))
      return maiorPosicao + 1
    }
  },
  watch: {
    show: {
      immediate: true,
      async handler(novoValor) {
        if (novoValor) {
          await Promise.all([
            this.carregarJogadores(),
            this.carregarTorneios()
          ])

          // Seleciona o último torneio automaticamente se não houver um selecionado
          if (!this.torneioSelecionado && this.torneios.length > 0) {
            this.torneioSelecionado = this.torneios[0] // Como já está ordenado por ID desc, este é o último
          }

          this.limparFormulario()
          
          // Foca no campo de jogador após carregar
          this.$nextTick(() => {
            if (this.$refs.jogadorSelect) {
              this.$refs.jogadorSelect.focus()
            }
          })
        }
      }
    }
  },
  methods: {
    async carregarJogadores() {
      try {
        const response = await axios.get('/jogadores')
        this.jogadores = response.data || []
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
    formatarMesAno(mes, ano) {
      if (!mes || !ano) return '-'
      const nomesMeses = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
      ]
      return `${nomesMeses[parseInt(mes) - 1]}/${ano}`
    },
    getJogadorLabel(jogador) {
      return `ID: ${jogador.id} - ${jogador.nome} (${jogador.nomeReal})`
    },
    limparFormulario() {
      this.resultado = {
        jogador: null,
        posicao: this.proximaPosicao,
        pontoBonus: false
      }
    },
    adicionarResultado() {
      if (this.formValido) {
        const novoResultado = {
          jogador: this.resultado.jogador,
          torneio: this.torneioSelecionado,
          posicao: this.resultado.posicao,
          pontoBonus: this.resultado.pontoBonus ? 'SIM' : 'NAO'
        }
        
        console.log('Adicionando resultado:', novoResultado)
        this.listaResultados.push(novoResultado)
        
        // Ordena a lista por posição
        this.listaResultados.sort((a, b) => a.posicao - b.posicao)
        
        // Limpa o formulário
        this.limparFormulario()
        
        // Força o foco no campo de jogador
        this.$nextTick(() => {
          const jogadorSelect = this.$refs.jogadorSelect
          if (jogadorSelect) {
            jogadorSelect.$el.querySelector('input').focus()
          }
        })
      }
    },
    removerDaLista(index) {
      this.listaResultados.splice(index, 1)
    },
    async salvarLista() {
      try {
        await axios.post('/resultadoTorneio/lista', this.listaResultados)
        this.$notify({
          message: 'Lista de resultados salva com sucesso!',
          type: 'success'
        })
        this.$emit('salvar')
        this.fechar()
      } catch (error) {
        console.error('Erro ao salvar lista:', error)
        this.$notify({
          message: 'Erro ao salvar lista de resultados.',
          type: 'danger'
        })
      }
    },
    fechar() {
      this.limparFormulario()
      this.listaResultados = []
      this.torneioSelecionado = null
      this.$emit('fechar')
    },
    togglePontoBonus(index) {
      const item = this.listaResultados[index]
      item.pontoBonus = item.pontoBonus === 'SIM' ? 'NAO' : 'SIM'
    }
  }
}
</script>

<style scoped>
.modal-lg {
  max-width: 800px;
}

/* Container da tabela com rolagem */
.table-container {
  max-height: 400px;
  overflow-y: auto;
  margin-bottom: 1rem;
  border: 1px solid #dee2e6;
  border-radius: 4px;
}

/* Mantém o cabeçalho da tabela fixo */
.table thead th {
  position: sticky;
  top: 0;
  background-color: white;
  z-index: 1;
  border-top: none;
}

/* Estilo para o switch do ponto bônus */
.custom-switch {
  padding-left: 2.25rem;
}

.custom-switch .custom-control-label {
  padding-top: 2px;
}

.custom-switch .custom-control-input:checked ~ .custom-control-label::before {
  background-color: #51cbce;
  border-color: #51cbce;
}

/* Estiliza a barra de rolagem */
.table-container::-webkit-scrollbar {
  width: 8px;
}

.table-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.table-container::-webkit-scrollbar-thumb {
  background: #51cbce;
  border-radius: 4px;
}

.table-container::-webkit-scrollbar-thumb:hover {
  background: #41a3a3;
}

/* Centraliza o modal na tela */
/deep/ .modal-dialog {
  display: flex;
  align-items: center;
  min-height: calc(100vh - 60px);
  margin: 30px auto;
}

/deep/ .modal-content {
  max-height: calc(100vh - 60px);
  display: flex;
  flex-direction: column;
}

/deep/ .modal-body {
  overflow-y: auto;
}
</style> 