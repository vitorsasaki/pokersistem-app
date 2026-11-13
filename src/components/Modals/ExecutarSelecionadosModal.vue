<template>
  <modal :show="show" @close="fecharModal">
    <template slot="header">
      <h4 class="modal-title">Executar Selecionados</h4>
    </template>

    <template slot="body">
      <p class="mb-3">
        {{ quantidade }} lançamento(s) selecionado(s). Escolha o novo tipo de lançamento:
      </p>
      <div class="form-group">
        <label>Tipo de Lançamento</label>
        <select class="form-control" v-model="tipoLancamento" required :disabled="executando">
          <option value="">Selecione o tipo</option>
          <option value="DEVE">Deve</option>
          <option value="ABATER">Abater</option>
          <option value="APROVAR">Aprovar</option>
          <option value="PAGO">Pago</option>
          <option value="SAQUE">Saque</option>
        </select>
      </div>
    </template>

    <template slot="footer">
      <button type="button" class="btn btn-secondary" @click="fecharModal" :disabled="executando">
        Cancelar
      </button>
      <button
        type="button"
        class="btn btn-primary"
        @click="confirmar"
        :disabled="!tipoLancamento || executando || quantidade === 0"
      >
        <i v-if="executando" class="fa fa-spinner fa-spin"></i>
        {{ executando ? 'Executando...' : 'Confirmar' }}
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
    quantidade: {
      type: Number,
      default: 0
    },
    executando: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      tipoLancamento: ''
    }
  },
  watch: {
    show(valor) {
      if (valor) {
        this.tipoLancamento = ''
      }
    }
  },
  methods: {
    fecharModal() {
      if (!this.executando) {
        this.$emit('fechar')
      }
    },
    confirmar() {
      if (!this.tipoLancamento) {
        return
      }
      this.$emit('confirmar', this.tipoLancamento)
    }
  }
}
</script>
