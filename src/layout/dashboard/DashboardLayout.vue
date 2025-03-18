<template>
  <div class="wrapper">
    <side-bar>
      <template slot="links">
        <sidebar-link
          to="/ranking"
          :name="'Ranking'"
          icon="ti-crown"
        />
        <sidebar-link
          to="/resultado-torneio"
          :name="'Resultados do Torneio'"
          icon="ti-cup"
        />
        <sidebar-link
          to="/jogador"
          :name="'Jogadores'"
          icon="ti-user"
        />
        <sidebar-link
          to="/torneio"
          :name="'Torneios'"
          icon="ti-flag"
        />
        <sidebar-link
          to="/tipos-torneio"
          :name="'Tipos de Torneio'"
          icon="ti-list"
        />
        <sidebar-link
          to="/devedores"
          :name="'Devedores'"
          icon="ti-money"
        />
        <sidebar-link
          to="/lancamentos"
          :name="'Lançamentos'"
          icon="ti-receipt"
        />
      </template>
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
