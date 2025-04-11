import { createRouter, createWebHistory } from "vue-router";
import StudentListView from "../views/StudentListView.vue";
import TeamView from "../components/TeamView.vue";
import TeamEditView from "../components/TeamEditView.vue";
import TeamNameEditView from "../components/TeamNameEditView.vue";
import PasswordView from "../components/PasswordView.vue";
import PresentationOrderView from "../components/PresentationOrderView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      redirect: "/students",
    },
    {
      path: "/students",
      name: "students",
      component: StudentListView,
    },
    {
      path: "/teams",
      name: "teams",
      component: TeamView,
      meta: { requiresAuth: true },
    },
    {
      path: "/teams/edit",
      name: "team-edit",
      component: TeamEditView,
      meta: { requiresAuth: true },
    },
    {
      path: "/teams/name-edit",
      name: "team-name-edit",
      component: TeamNameEditView,
      meta: { requiresAuth: true },
    },
    {
      path: "/presentation-order",
      name: "presentation-order",
      component: PresentationOrderView,
      meta: { requiresAuth: true },
    },
    {
      path: "/password",
      name: "password",
      component: PasswordView,
    },
    {
      path: "/:pathMatch(.*)*",
      redirect: "/students",
    },
  ],
});

// 네비게이션 가드
router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth) {
    const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
    if (!isAuthenticated) {
      next({ name: "password", query: { redirect: to.fullPath } });
    } else {
      next();
    }
  } else {
    next();
  }
});

export default router;
