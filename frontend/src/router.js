import { createRouter, createWebHistory } from "vue-router";
import Home from "./views/Home.vue";
import SectionManagement from "./views/SectionManagement.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: Home,
    },
    {
      path: "/sections/:sectionId",
      name: "section",
      component: SectionManagement,
    },
    {
      path: "/:pathMatch(.*)*",
      redirect: { name: "home" },
    },
    
  ],
});

export default router;
