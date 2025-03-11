<template>
  <div class="wrapper">
    <side-bar>
      <template slot="links">
        <sidebar-link to="/dashboard" name="Dashboard" icon="ti-panel" />
        <sidebar-link to="/icons" name="Icons" icon="ti-pencil-alt2" />
        <sidebar-link to="/player" name="Jogador" icon="ti-user" />
        <sidebar-link to="/tipos-torneio" name="Tipos de Torneio" icon="ti-uppercase" />
        <sidebar-link to="/torneios" name="Torneios" icon="ti-text" />
        <sidebar-link to="/devedores">
          <i class="ti-money"></i>
          <p>Devedores</p>
        </sidebar-link>
        <sidebar-link to="/lancamentos">
          <i class="ti-book"></i>
          <p>Lançamentos</p>
        </sidebar-link>
        <sidebar-link
          to="/resultado-torneio"
          name="Resultados do Torneio"
          icon="ti-cup"
        />
      </template>
      <mobile-menu>
        <li class="nav-item">
          <a class="nav-link">
            <i class="ti-panel"></i>
            <p>Dashboard</p>
          </a>
        </li>
        <li class="nav-item">
          <a class="nav-link">
            <i class="ti-settings"></i>
            <p>Configurações</p>
          </a>
        </li>
      </mobile-menu>
    </side-bar>
    <div class="main-panel">
      <top-navbar></top-navbar>

      <dashboard-content @click.native="toggleSidebar"> </dashboard-content>

      <content-footer></content-footer>
    </div>
  </div>
</template>
<style lang="scss"></style>
<script>
import TopNavbar from "./TopNavbar.vue";
import ContentFooter from "./ContentFooter.vue";
import DashboardContent from "./Content.vue";
import MobileMenu from "./MobileMenu";
export default {
  components: {
    TopNavbar,
    ContentFooter,
    DashboardContent,
    MobileMenu,
  },
  methods: {
    toggleSidebar() {
      if (this.$sidebar.showSidebar) {
        this.$sidebar.displaySidebar(false);
      }
    },
  },
};
</script>
