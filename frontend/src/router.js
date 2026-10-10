import { createRouter, createWebHistory } from "vue-router";
import Login from "./views/Login.vue";
import Faculty from "./views/Faculty.vue";
import Register from "./views/Register.vue";
import Semester from "./views/Semester.vue/";
import CourseList from "./views/CourseList.vue";
import SectionsList from "./views/SectionsList.vue"
import SectionManagement from "./views/SectionManagement.vue";
import EnrollmentList from "./views/EnrollmentList.vue";
import Utils from "./config/utils.js";

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
      component: SectionsList,
      meta: {
        requiresAuth: true,
        role: "admin",
      },
    },
    {
      path: "/course-list",
      meta: {
        requiresAuth: true,
        role: Utils.ROLE_ADMIN,
      },
      name: "CourseList",
      meta: {
        component: CourseList
      },
      component: CourseList,
    },
    {
      path: "/faculty",
      meta: {
        requiresAuth: true,
        role: Utils.ROLE_ADMIN,
      },
      name: "Faculty",
      meta: {
        component: Faculty
      },
      component: Faculty,
    },
    {
      path: "/semester",
      meta: {
        requiresAuth: true,
        role: Utils.ROLE_ADMIN,
      },
      name: "Semester",
      meta: {
        component: Semester
      },
      component: Semester,
    },
    {
      path: "/enrollment-list",
      meta: {
        requiresAuth: true,
      },
      name: "EnrollmentList",
      component: EnrollmentList,
    },
    {
      path: "/sections/:sectionId",
      name: "section",
      component: SectionManagement,
    },
    {
      path: "/:pathMatch(.*)*",
      redirect: { name: "Login" },
    }
  ],
});

router.beforeEach((to) => {
  const user = Utils.getStore("user");
  const isPublic = to.name === "Login" || to.name === "Register";

  if (!user?.token && !isPublic) {
    return { name: "Login" };
  }

  if (user?.token && isPublic) {
    return user.role === "admin"
      ? { name: "Semester" }
      : { name: "EnrollmentList" };
  }

  if (to.meta.requiresAdmin && user?.role !== "admin") {
    return { name: "EnrollmentList" };
  }
});

export default router;