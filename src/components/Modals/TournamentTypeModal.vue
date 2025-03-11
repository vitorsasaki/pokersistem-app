<template>
  <modal :show="show" @close="fecharModal">
    <template slot="header">
      <h4 class="modal-title">
        {{ tipoTorneioEdit ? 'Editar' : 'Novo' }} Tipo de Torneio
      </h4>
    </template>

    <template slot="body">
      <form @submit.prevent="salvar">
        <div class="row">
          <!-- Dia da Semana -->
          <div class="col-md-6">
            <div class="form-group">
              <label>Dia da Semana</label>
              <select class="form-control" v-model="tipoTorneio.diaSemana" required>
                <option value="">Selecione o dia</option>
                <option value="SEGUNDA">Segunda-feira</option>
                <option value="TERCA">Terça-feira</option>
                <option value="QUARTA">Quarta-feira</option>
                <option value="QUINTA">Quinta-feira</option>
                <option value="SEXTA">Sexta-feira</option>
                <option value="SABADO">Sábado</option>
                <option value="DOMINGO">Domingo</option>
              </select>
            </div>
          </div>

          <!-- Stack Inicial -->
          <div class="col-md-6">
            <div class="form-group">
              <label>Stack Inicial</label>
              <input
                type="number"
                class="form-control"
                v-model.number="tipoTorneio.stackInicial"
                required
                min="0"
              />
            </div>
          </div>

          <!-- Stack Rebuy -->
          <div class="col-md-6">
            <div class="form-group">
              <label>Stack Rebuy</label>
              <input
                type="number"
                class="form-control"
                v-model.number="tipoTorneio.stackRebuy"
                required
                min="0"
              />
            </div>
          </div>

          <!-- Stack Addon -->
          <div class="col-md-6">
            <div class="form-group">
              <label>Stack Addon</label>
              <input
                type="number"
                class="form-control"
                v-model.number="tipoTorneio.stackAddon"
                required
                min="0"
              />
            </div>
          </div>

          <!-- Valor -->
          <div class="col-md-4">
            <div class="form-group">
              <label>Valor Buy-in</label>
              <input
                type="number"
                class="form-control"
                v-model.number="tipoTorneio.valor"
                required
                min="0"
                step="0.01"
              />
            </div>
          </div>

          <!-- Valor Rebuy -->
          <div class="col-md-4">
            <div class="form-group">
              <label>Valor Rebuy</label>
              <input
                type="number"
                class="form-control"
                v-model.number="tipoTorneio.valorRebuy"
                required
                min="0"
                step="0.01"
              />
            </div>
          </div>

          <!-- Valor Addon -->
          <div class="col-md-4">
            <div class="form-group">
              <label>Valor Addon</label>
              <input
                type="number"
                class="form-control"
                v-model.number="tipoTorneio.valorAddon"
                required
                min="0"
                step="0.01"
              />
            </div>
          </div>

          <!-- Registro Tardio -->
          <div class="col-md-12">
            <div class="form-group">
              <label>Registro Tardio (em minutos)</label>
              <input
                type="number"
                class="form-control"
                v-model.number="tipoTorneio.registroTardio"
                required
                min="0"
                placeholder="Digite o tempo limite para registro tardio em minutos"
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
        {{ tipoTorneioEdit ? 'Atualizar' : 'Criar' }}
      </button>
    </template>
  </modal>
</template>

<script>
import Modal from '../Modal.vue'

export default {
  components: {
    Modal
  },
  props: {
    show: {
      type: Boolean,
      default: false
    },
    tipoTorneioEdit: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      tipoTorneio: {
        diaSemana: '',
        stackInicial: 0,
        stackRebuy: 0,
        stackAddon: 0,
        valor: 0,
        valorRebuy: 0,
        valorAddon: 0,
        registroTardio: 0
      }
    }
  },
  watch: {
    tipoTorneioEdit(novoValor) {
      if (novoValor) {
        this.tipoTorneio = { ...novoValor }
      } else {
        this.limparFormulario()
      }
    }
  },
  methods: {
    limparFormulario() {
      this.tipoTorneio = {
        diaSemana: '',
        stackInicial: 0,
        stackRebuy: 0,
        stackAddon: 0,
        valor: 0,
        valorRebuy: 0,
        valorAddon: 0,
        registroTardio: 0
      }
    },
    fecharModal() {
      this.limparFormulario()
      this.$emit('fechar')
    },
    salvar() {
      this.$emit('salvar', { ...this.tipoTorneio })
      this.fecharModal()
    }
  }
}
</script>

<style scoped>
.custom-switch {
  padding-left: 2.25rem;
}
.custom-control-label {
  padding-top: 2px;
}
</style> 