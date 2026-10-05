import { createRouter, createWebHistory } from "vue-router";
import Login from "./views/Login.vue";
import Faculty from "./views/Faculty.vue";
import Register from "./views/Register.vue";
import Semester from "./views/Semester.vue/";
import CourseList from "./views/CourseList.vue";
import SectionsList from "./views/SectionsList.vue"
import EnrollmentList from "./views/EnrollmentList.vue";

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
      path: "/sections",
      name: "Sections",
      component: SectionsList
    },
    {
      path: "/course-list",
      name: "CourseList",
      component: CourseList,
    },
    {
      path: "/faculty",
      name: "Faculty",
      component: Faculty,
    },
    {
      path: "/semester",
      name: "Semester",
      component: Semester,
    },
    {
      path: "/enrollment-list",
      name: "EnrollmentList",
      component: EnrollmentList,
      props: true
    },
    {
      path: "/:pathMatch(.*)*",
      redirect: { name: "Login" },
    }
  ],
});

export default router;