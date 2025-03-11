<template>
  <modal :show="show" @close="fecharModal">
    <template slot="header">
      <h4 class="modal-title">
        {{ torneioEdit ? 'Editar' : 'Novo' }} Torneio
      </h4>
    </template>

    <template slot="body">
      <form @submit.prevent="salvar">
        <div class="row">
          <!-- Ano e Mês do Ranking -->
          <div class="col-md-6">
            <div class="form-group">
              <label>Ano do Ranking</label>
              <input
                type="number"
                class="form-control"
                v-model.number="torneio.anoRanking"
                required
                min="2000"
                :max="anoAtual"
              />
            </div>
          </div>
          <div class="col-md-6">
            <div class="form-group">
              <label>Mês do Ranking</label>
              <select class="form-control" v-model="torneio.mesRanking" required>
                <option value="">Selecione o mês</option>
                <option value="1">Janeiro</option>
                <option value="2">Fevereiro</option>
                <option value="3">Março</option>
                <option value="4">Abril</option>
                <option value="5">Maio</option>
                <option value="6">Junho</option>
                <option value="7">Julho</option>
                <option value="8">Agosto</option>
                <option value="9">Setembro</option>
                <option value="10">Outubro</option>
                <option value="11">Novembro</option>
                <option value="12">Dezembro</option>
              </select>
            </div>
          </div>

          <!-- Data do Torneio -->
          <div class="col-md-6">
            <div class="form-group">
              <label>Data do Torneio</label>
              <input
                type="date"
                class="form-control"
                v-model="torneio.dataTorneio"
                required
              />
            </div>
          </div>

          <!-- Tipo de Torneio -->
          <div class="col-md-6">
            <div class="form-group">
              <label>Tipo de Torneio</label>
              <select class="form-control" v-model="torneio.tipoTorneio" required>
                <option value="">Selecione o tipo</option>
                <option v-for="tipo in tiposTorneio" :key="tipo.id" :value="tipo">
                  {{ tipo.diaSemana }}
                </option>
              </select>
            </div>
          </div>

          <!-- Torneio do Ranking -->
          <div class="col-md-6">
            <div class="form-group">
              <label>Torneio do Ranking</label>
              <select class="form-control" v-model="torneio.torneioDoRanking" required>
                <option value="">Selecione uma opção</option>
                <option value="SIM">Sim</option>
                <option value="NAO">Não</option>
              </select>
            </div>
          </div>

          <!-- Número de Entradas -->
          <div class="col-md-6">
            <div class="form-group">
              <label>Número de Entradas</label>
              <input
                type="number"
                class="form-control"
                v-model.number="torneio.numeroEntradas"
                min="0"
                required
              />
            </div>
          </div>

          <!-- Rake -->
          <div class="col-md-6">
            <div class="form-group">
              <label>Rake</label>
              <input
                type="number"
                class="form-control"
                v-model.number="torneio.rake"
                min="0"
                step="0.01"
                required
              />
            </div>
          </div>

          <!-- Total Buy-ins -->
          <div class="col-md-6">
            <div class="form-group">
              <label>Total Buy-ins</label>
              <input
                type="number"
                class="form-control"
                v-model.number="torneio.totalBuyins"
                min="0"
                step="0.01"
                required
              />
            </div>
          </div>

          <!-- Total Rebuys -->
          <div class="col-md-6">
            <div class="form-group">
              <label>Total Rebuys</label>
              <input
                type="number"
                class="form-control"
                v-model.number="torneio.totalRebuys"
                min="0"
                step="0.01"
                required
              />
            </div>
          </div>

          <!-- Total Add-ons -->
          <div class="col-md-6">
            <div class="form-group">
              <label>Total Add-ons</label>
              <input
                type="number"
                class="form-control"
                v-model.number="torneio.totalAddons"
                min="0"
                step="0.01"
                required
              />
            </div>
          </div>

          <!-- Total Premiação -->
          <div class="col-md-6">
            <div class="form-group">
              <label>Total Premiação</label>
              <input
                type="number"
                class="form-control"
                v-model.number="torneio.totalPremiacao"
                min="0"
                step="0.01"
                required
              />
            </div>
          </div>

          <div class="col-md-6">
            <div class="form-group">
              <label>Peso do Torneio</label>
              <input
                type="number"
                class="form-control"
                v-model.number="torneio.peso"
                min="0"
                step="0.01"
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
        {{ torneioEdit ? 'Atualizar' : 'Criar' }}
      </button>
    </template>
  </modal>
</template>

<script>
import Modal from '../Modal.vue'
import axios from '@/config/axios'

export default {
  components: {
    Modal
  },
  props: {
    show: {
      type: Boolean,
      default: false
    },
    torneioEdit: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      torneio: {
        anoRanking: new Date().getFullYear(),
        mesRanking: new Date().getMonth() + 1,
        dataTorneio: '',
        tipoTorneio: null,
        torneioDoRanking: '',
        numeroEntradas: 0,
        rake: 0,
        totalBuyins: 0,
        totalRebuys: 0,
        totalAddons: 0,
        totalPremiacao: 0
      },
      tiposTorneio: []
    }
  },
  computed: {
    anoAtual() {
      return new Date().getFullYear()
    }
  },
  watch: {
    torneioEdit(novoValor) {
      if (novoValor) {
        this.torneio = { ...novoValor }
      } else {
        this.limparFormulario()
      }
    },
    show(novoValor) {
      if (novoValor) {
        this.carregarTiposTorneio()
      }
    }
  },
  methods: {
    async carregarTiposTorneio() {
      try {
        const response = await axios.get('/tipoTorneio')
        if (response.data) {
          this.tiposTorneio = Array.isArray(response.data) ? response.data : 
                             (response.data.content || response.data.data || [])
        }
      } catch (error) {
        console.error('Erro ao carregar tipos de torneio:', error)
        this.$notify({
          message: 'Erro ao carregar tipos de torneio. Por favor, tente novamente.',
          type: 'danger'
        })
      }
    },
    limparFormulario() {
      this.torneio = {
        anoRanking: new Date().getFullYear(),
        mesRanking: new Date().getMonth() + 1,
        dataTorneio: '',
        tipoTorneio: null,
        torneioDoRanking: '',
        numeroEntradas: 0,
        rake: 0,
        totalBuyins: 0,
        totalRebuys: 0,
        totalAddons: 0,
        totalPremiacao: 0
      }
    },
    fecharModal() {
      this.limparFormulario()
      this.$emit('fechar')
    },
    salvar() {
      // Cria uma cópia do objeto torneio
      const torneioParaSalvar = { ...this.torneio }
      
      // Garante que os campos numéricos sejam números
      torneioParaSalvar.anoRanking = Number(torneioParaSalvar.anoRanking)
      torneioParaSalvar.mesRanking = Number(torneioParaSalvar.mesRanking)
      torneioParaSalvar.numeroEntradas = Number(torneioParaSalvar.numeroEntradas)
      torneioParaSalvar.rake = Number(torneioParaSalvar.rake)
      torneioParaSalvar.totalBuyins = Number(torneioParaSalvar.totalBuyins)
      torneioParaSalvar.totalRebuys = Number(torneioParaSalvar.totalRebuys)
      torneioParaSalvar.totalAddons = Number(torneioParaSalvar.totalAddons)
      torneioParaSalvar.totalPremiacao = Number(torneioParaSalvar.totalPremiacao)

      // Formata a data para o formato esperado pela API (YYYY-MM-DD)
      if (torneioParaSalvar.dataTorneio) {
        const data = new Date(torneioParaSalvar.dataTorneio)
        torneioParaSalvar.dataTorneio = data.toISOString().split('T')[0]
      }

      this.$emit('salvar', torneioParaSalvar)
      this.fecharModal()
    }
  }
}
</script>

<style scoped>
.form-group {
  margin-bottom: 1rem;
}
</style> 