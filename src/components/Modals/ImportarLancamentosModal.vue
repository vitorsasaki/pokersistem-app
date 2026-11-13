<template>
  <modal :show="show" @close="fecharModal">
    <template slot="header">
      <h4 class="modal-title">Importar Lançamentos</h4>
    </template>

    <template slot="body">
      <div class="form-group">
        <label>Planilha (.xlsx)</label>
        <input
          type="file"
          class="form-control-file"
          accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          @change="onArquivoSelecionado"
          :disabled="importando"
        />
        <small class="form-text text-muted" v-if="arquivo">
          Arquivo selecionado: {{ arquivo.name }}
        </small>
      </div>

      <div v-if="resultado" class="mt-3">
        <div class="alert alert-success" v-if="resultado.importados > 0">
          {{ resultado.importados }} lançamento(s) importado(s) com sucesso.
        </div>
        <div class="alert alert-warning" v-if="resultado.erros && resultado.erros.length">
          <strong>{{ resultado.erros.length }} erro(s):</strong>
          <ul class="mb-0 mt-2">
            <li v-for="(erro, index) in resultado.erros" :key="index">
              <span v-if="erro.linha">Linha {{ erro.linha }}:</span>
              {{ erro.motivo }}
            </li>
          </ul>
        </div>
      </div>
    </template>

    <template slot="footer">
      <button type="button" class="btn btn-secondary" @click="fecharModal" :disabled="importando">
        Fechar
      </button>
      <button
        type="button"
        class="btn btn-primary"
        @click="importar"
        :disabled="!arquivo || importando"
      >
        <i v-if="importando" class="fa fa-spinner fa-spin"></i>
        {{ importando ? 'Importando...' : 'Importar' }}
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
    }
  },
  data() {
    return {
      arquivo: null,
      importando: false,
      resultado: null
    }
  },
  watch: {
    show(valor) {
      if (valor) {
        this.arquivo = null
        this.resultado = null
        this.importando = false
      }
    }
  },
  methods: {
    onArquivoSelecionado(event) {
      const files = event.target.files
      this.arquivo = files && files.length ? files[0] : null
      this.resultado = null
    },
    fecharModal() {
      this.$emit('fechar')
    },
    async importar() {
      if (!this.arquivo) {
        return
      }

      const formData = new FormData()
      formData.append('file', this.arquivo)

      try {
        this.importando = true
        const response = await axios.post('/lancamentoDevedor/importar', formData, {
          headers: {
            'Content-Type': undefined
          }
        })
        this.resultado = response.data
        this.$emit('importado', response.data)

        if (response.data.importados > 0) {
          this.$notify({
            message: `${response.data.importados} lançamento(s) importado(s)!`,
            type: 'success'
          })
        }

        if (response.data.erros && response.data.erros.length) {
          this.$notify({
            message: `${response.data.erros.length} linha(s) com erro na importação.`,
            type: 'warning'
          })
        }
      } catch (error) {
        console.error('Erro ao importar lançamentos:', error)
        this.$notify({
          message: error.response?.data?.message || 'Erro ao importar lançamentos.',
          type: 'danger'
        })
      } finally {
        this.importando = false
      }
    }
  }
}
</script>
