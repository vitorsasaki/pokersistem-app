<template>
  <div class="modal" tabindex="-1" role="dialog" :class="{ 'show d-block': show }">
    <div class="modal-dialog" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">{{ jogador.id ? 'Editar' : 'Novo' }} Jogador</h5>
          <button type="button" class="close" @click="fechar">
            <span>&times;</span>
          </button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="salvar">
            <div class="form-group">
              <label>Nome</label>
              <input
                type="text"
                class="form-control"
                v-model="jogador.nome"
                required
                placeholder="Nome do jogador no clube"
              />
            </div>
            <div class="form-group">
              <label>Nome Real</label>
              <input
                type="text"
                class="form-control"
                v-model="jogador.nomeReal"
                required
                placeholder="Nome completo do jogador"
              />
            </div>
            <div class="form-group">
              <label>IDPP</label>
              <input
                type="text"
                class="form-control"
                v-model="jogador.idpp"
                required
                placeholder="Identificador PP do jogador"
              />
            </div>
            <div class="form-group">
              <label>Login</label>
              <input
                type="text"
                class="form-control"
                v-model="jogador.login"
                required
                placeholder="Login de acesso do jogador"
              />
            </div>
            <div class="form-group">
              <label>Senha</label>
              <input
                type="password"
                class="form-control"
                v-model="jogador.senha"
                required
                placeholder="Senha de acesso"
              />
            </div>
            <div class="form-group">
              <label>Estado</label>
              <select class="form-control" v-model="jogador.estado" required>
                <option value="">Selecione um estado</option>
                <option value="AC">Acre</option>
                <option value="AL">Alagoas</option>
                <option value="AP">Amapá</option>
                <option value="AM">Amazonas</option>
                <option value="BA">Bahia</option>
                <option value="CE">Ceará</option>
                <option value="DF">Distrito Federal</option>
                <option value="ES">Espírito Santo</option>
                <option value="GO">Goiás</option>
                <option value="MA">Maranhão</option>
                <option value="MT">Mato Grosso</option>
                <option value="MS">Mato Grosso do Sul</option>
                <option value="MG">Minas Gerais</option>
                <option value="PA">Pará</option>
                <option value="PB">Paraíba</option>
                <option value="PR">Paraná</option>
                <option value="PE">Pernambuco</option>
                <option value="PI">Piauí</option>
                <option value="RJ">Rio de Janeiro</option>
                <option value="RN">Rio Grande do Norte</option>
                <option value="RS">Rio Grande do Sul</option>
                <option value="RO">Rondônia</option>
                <option value="RR">Roraima</option>
                <option value="SC">Santa Catarina</option>
                <option value="SP">São Paulo</option>
                <option value="SE">Sergipe</option>
                <option value="TO">Tocantins</option>
              </select>
            </div>
            <div class="form-group">
              <label>Celular</label>
              <input
                type="celular"
                class="form-control"
                v-model="jogador.celular"
                required
                placeholder="Celular do jogador"
              />
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="fechar">
            Cancelar
          </button>
          <button type="button" class="btn btn-primary" @click="salvar">
            Salvar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PlayerModal',
  props: {
    show: {
      type: Boolean,
      default: false
    },
    jogadorEdit: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      jogador: {
        id: null,
        nome: '',
        nomeReal: '',
        estado: '',
        idpp: '',
        login: '',
        senha: '',
        celular: ''
      }
    }
  },
  watch: {
    jogadorEdit(novoJogador) {
      if (novoJogador) {
        const { senha, ...dadosJogador } = novoJogador
        this.jogador = { 
          ...this.jogador,
          ...dadosJogador,
          senha: '',
          celular: ''
        }
      } else {
        this.limparFormulario()
      }
    }
  },
  methods: {
    fechar() {
      this.$emit('fechar')
      this.limparFormulario()
    },
    salvar() {
      if (this.jogador.id && !this.jogador.senha) {
        const { senha, ...dadosParaSalvar } = this.jogador
        this.$emit('salvar', dadosParaSalvar)
      } else {
        this.$emit('salvar', { ...this.jogador })
      }
      this.fechar()
    },
    limparFormulario() {
      this.jogador = {
        id: null,
        nome: '',
        nomeReal: '',
        estado: '',
        idpp: '',
        login: '',
        senha: '',
        celular: ''
      }
    }
  }
}
</script>

<style scoped>
.modal {
  background-color: rgba(0, 0, 0, 0.5);
}
.modal-dialog {
  margin-top: 100px;
}
</style> 