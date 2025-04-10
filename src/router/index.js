import { createRouter, createWebHistory } from "vue-router";
import StudentListView from "../views/StudentListView.vue";
import NotFoundView from "../views/NotFoundView.vue";

const router = createRouter({
  history: createWebHistory(),
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
      path: "/:pathMatch(.*)*",
      name: "not-found",
      component: NotFoundView,
    },
  ],
});

export default router;
