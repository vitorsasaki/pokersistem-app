<template>
  <nav class="navbar navbar-expand-lg navbar-light">
    <div class="container-fluid">
      <a class="navbar-brand" href="#">{{ routeName }}</a>
      <button
        class="navbar-toggler navbar-burger"
        type="button"
        @click="toggleSidebar"
        :aria-expanded="$sidebar.showSidebar"
        aria-label="Toggle navigation"
      >
        <span class="navbar-toggler-bar"></span>
        <span class="navbar-toggler-bar"></span>
        <span class="navbar-toggler-bar"></span>
      </button>
      <div class="collapse navbar-collapse">
        <ul class="navbar-nav ml-auto">
          <li class="nav-item">
            <a class="nav-link" href="#" @click.prevent="fazerLogout">
              <i class="fas fa-sign-out-alt"></i> Sair
            </a>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>
<script>
export default {
  computed: {
    routeName() {
      const { name } = this.$route;
      return this.capitalizeFirstLetter(name);
    },
  },
  data() {
    return {
      activeNotifications: false,
    };
  },
  methods: {
    capitalizeFirstLetter(string) {
      return string.charAt(0).toUpperCase() + string.slice(1);
    },
    toggleNotificationDropDown() {
      this.activeNotifications = !this.activeNotifications;
    },
    closeDropDown() {
      this.activeNotifications = false;
    },
    toggleSidebar() {
      this.$sidebar.displaySidebar(!this.$sidebar.showSidebar);
      if (this.$sidebar.showSidebar) {
        document.body.classList.add('nav-open');
      } else {
        document.body.classList.remove('nav-open');
      }
    },
    hideSidebar() {
      this.$sidebar.displaySidebar(false);
    },
    async fazerLogout() {
      try {
        // Remove o token do localStorage
        localStorage.removeItem('token');
        
        // Redireciona para a página de login
        this.$router.push('/login');
      } catch (error) {
        console.error('Erro ao fazer logout:', error);
      }
    }
  },
};
</script>
<style scoped>
.nav-link {
  cursor: pointer;
  color: #666;
  transition: color 0.3s ease;
}

.nav-link:hover {
  color: #333;
}

.fas {
  margin-right: 5px;
}
</style>
