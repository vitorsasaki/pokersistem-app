import Vue from "vue";
import Router from "vue-router";
import Login from "@/pages/Login.vue";
import Ranking from "@/pages/Ranking.vue";
import ResultadoTorneio from "@/pages/ResultadoTorneio.vue";
import Jogador from "@/pages/Player.vue";
import Torneio from "@/pages/Torneio.vue";
import TournamentType from "@/pages/TournamentType.vue";
import Devedores from "@/pages/Devedores.vue";
import Lancamento from "@/pages/Lancamento.vue";

Vue.use(Router);

const router = new Router({
  routes: [
    {
      path: "/",
      redirect: "/login"
    },
    {
      path: "/login",
      name: "Login",
      component: Login,
      meta: { public: true }
    },
    {
      path: "/",
      component: () => import("@/layout/dashboard/DashboardLayout.vue"),
      children: [
        {
          path: "ranking",
          name: "Ranking",
          component: Ranking
        },
        {
          path: "resultado-torneio",
          name: "ResultadoTorneio",
          component: ResultadoTorneio
        },
        {
          path: "jogador",
          name: "Jogador",
          component: Jogador
        },
        {
          path: "torneio",
          name: "Torneio",
          component: Torneio
        },
        {
          path: "tipos-torneio",
          name: "TournamentType",
          component: TournamentType
        },
        {
          path: "devedores",
          name: "Devedores",
          component: Devedores
        },
        {
          path: "lancamentos",
          name: "Lancamento",
          component: Lancamento
        }
      ]
    }
  ]
});

// Proteção de rotas
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem("token");
  
  if (to.meta.public) {
    next();
  } else if (!token) {
    next("/login");
  } else {
    next();
  }
});

export default router;
