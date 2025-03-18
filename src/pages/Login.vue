<template>
  <div class="login-page">
    <div class="login-box">
      <h2>Login</h2>
      <div class="login-logo">
        <h2>Poker Sistem</h2>
      </div>
      <div class="card">
        <div class="card-body login-card-body">
          <p class="login-box-msg">Faça login para iniciar sua sessão</p>

          <form @submit.prevent="fazerLogin">
            <div class="input-group mb-3">
              <input 
                type="text" 
                class="form-control" 
                v-model="login"
                placeholder="Login"
                required
                autofocus
              >
              <div class="input-group-append">
                <div class="input-group-text">
                  <i class="ti-user"></i>
                </div>
              </div>
            </div>

            <div class="input-group mb-3">
              <input 
                type="password" 
                class="form-control" 
                v-model="password"
                placeholder="Senha"
                required
              >
              <div class="input-group-append">
                <div class="input-group-text">
                  <i class="ti-lock"></i>
                </div>
              </div>
            </div>

            <div class="row">
              <div class="col-12">
                <button 
                  type="submit" 
                  class="btn btn-primary btn-block"
                  :disabled="carregando"
                >
                  <i class="ti-sign-in mr-1"></i>
                  {{ carregando ? 'Entrando...' : 'Entrar' }}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from '@/config/axios'

export default {
  name: 'Login',
  data() {
    return {
      login: '',
      password: '',
      carregando: false
    }
  },
  methods: {
    async fazerLogin() {
      try {
        this.carregando = true
        
        const response = await axios.post('/auth/login', {
          login: this.login,
          password: this.password
        })

        if (response.data) {
          // Armazena o token no localStorage
          localStorage.setItem('token', response.data.token)
          
          // Configura o token no axios para próximas requisições
          axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`
          
          this.$notify({
            message: 'Login realizado com sucesso!',
            type: 'success'
          })

          // Redireciona para a página de ranking
          this.$router.push('/ranking')
        }
      } catch (error) {
        console.error('Erro no login:', error)
        this.$notify({
          message: 'Login ou senha inválidos. Tente novamente.',
          type: 'danger'
        })
      } finally {
        this.carregando = false
      }
    }
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-image: url('../assets/img/capa_poker1.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

.login-box {
  background: rgba(255, 255, 255, 0.9);
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.3);
  width: 100%;
  max-width: 400px;
}

h2 {
  text-align: center;
  margin-bottom: 2rem;
  color: #333;
}

.login-logo {
  text-align: center;
  margin-bottom: 25px;
}

.login-logo h2 {
  color: white;
  font-weight: 300;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
}

.login-card-body {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

.login-box-msg {
  text-align: center;
  margin-bottom: 20px;
  color: #666;
}

.input-group-text {
  background-color: #f8f9fa;
  border: 1px solid #ced4da;
}

.btn-primary {
  background-color: #51cbce;
  border-color: #51cbce;
}

.btn-primary:hover {
  background-color: #34b5b8;
  border-color: #34b5b8;
}

.btn-primary:disabled {
  background-color: #51cbce;
  border-color: #51cbce;
  opacity: 0.7;
}

.form-control:focus {
  border-color: #51cbce;
  box-shadow: 0 0 0 0.2rem rgba(81, 203, 206, 0.25);
}
</style> 