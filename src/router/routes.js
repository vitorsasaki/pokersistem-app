import DashboardLayout from "@/layout/dashboard/DashboardLayout.vue";
// GeneralViews
import NotFound from "@/pages/NotFoundPage.vue";

// Admin pages
import Dashboard from "@/pages/Dashboard.vue";
import Icons from "@/pages/Icons.vue";
import Player from "@/pages/Player.vue";
import TournamentType from "@/pages/TournamentType.vue";
import Torneio from "@/pages/Torneio.vue";
import Devedores from '@/pages/Devedores.vue'
import Lancamento from '@/pages/Lancamento.vue'
import ResultadoTorneio from '@/pages/ResultadoTorneio.vue'

const routes = [
  {
    path: "/",
    component: DashboardLayout,
    redirect: "/dashboard",
    children: [
      {
        path: "dashboard",
        name: "dashboard",
        component: Dashboard,
      },
      {
        path: "icons",
        name: "icons",
        component: Icons,
      },
      {
        path: "player",
        name: "player",
        component: Player,
      },
      {
        path: "tipos-torneio",
        name: "tipos-torneio",
        component: TournamentType,
      },
      {
        path: "torneios",
        name: "torneios",
        component: Torneio,
      },
      {
        path: 'devedores',
        name: 'devedores',
        component: Devedores
      },
      {
        path: 'lancamentos',
        name: 'lancamentos',
        component: Lancamento
      },
      {
        path: '/resultado-torneio',
        name: 'Resultado do Torneio',
        component: ResultadoTorneio
      },
    ],
  },
  { path: "*", component: NotFound },
];

/**
 * Asynchronously load view (Webpack Lazy loading compatible)
 * The specified component must be inside the Views folder
 * @param  {string} name  the filename (basename) of the view to load.
function view(name) {
   var res= require('../components/Dashboard/Views/' + name + '.vue');
   return res;
};**/

export default routes;
