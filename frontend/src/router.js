import { createRouter, createWebHistory } from "vue-router";
import Home from "./views/Home.vue";
import Login from "./views/Login.vue";
import Register from "./views/Register.vue";
// import Games from "./views/Games.vue";
// import TeamList from "./views/TeamList.vue";
// import Leagues from "./views/Leagues.vue";
// import Team from "./views/Team.vue";
// import PeopleList from "./views/PeopleList.vue";
// import Season from "./views/Season.vue";
// import SeasonList from "./views/SeasonList.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "Login",
      component: Login,
    },
    {
      path: "/register",
      name: "Register",
      component: Register,
    },
    {
      path: "/home",
      name: "Home",
      component: Home,
    },
    {
      path: "/team-list",
      name: "TeamList",
      component: TeamList,
    },
    {
      path: "/games",
      name: "Games",
      component: Games,
    },
    {
      path: "/leagues",
      name: "Leagues",
      component: Leagues,
    },
    {
      path: "/team",
      name: "Team",
      component: Team,
    },
    {
      path: "/people-list",
      name: "PeopleList",
      component: PeopleList,  
    },
    {
      path: "/season",
      name: "Season",
      component: Season,
    },
    {
      path: "/season-list",
      name: "SeasonList",
      component: SeasonList,
    },
    {
      path: "/:pathMatch(.*)*",
      redirect: { name: "Login" },
    }
  ],
});
