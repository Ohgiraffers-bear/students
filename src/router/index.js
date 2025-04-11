import { createRouter, createWebHistory } from "vue-router";
import StudentListView from "../views/StudentListView.vue";
import NotFoundView from "../views/NotFoundView.vue";
import TeamView from "../components/TeamView.vue";
import TeamEditView from "../components/TeamEditView.vue";
import TeamNameEditView from "../components/TeamNameEditView.vue";
import PasswordView from "../components/PasswordView.vue";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      redirect: "/password",
    },
    {
      path: "/password",
      name: "password",
      component: PasswordView,
    },
    {
      path: "/students",
      name: "students",
      component: StudentListView,
      meta: { requiresAuth: true },
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
      path: "/:pathMatch(.*)*",
      name: "not-found",
      component: NotFoundView,
    },
  ],
});

// 네비게이션 가드 추가
router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth && !localStorage.getItem("isAuthenticated")) {
    next("/password");
  } else {
    next();
  }
});

export default router;
