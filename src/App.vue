<template>
  <div class="container">
    <h1>KB 학생 관리 시스템</h1>

    <nav v-if="$route.path !== '/password'" class="nav-menu">
      <router-link to="/students">학생 목록</router-link>
      <router-link to="/teams">팀별 보기</router-link>
      <router-link to="/teams/edit">팀 편집</router-link>
      <router-link to="/teams/name-edit">팀 이름 수정</router-link>
      <router-link to="/presentation-order">발표 순서 뽑기</router-link>
    </nav>

    <router-view />
  </div>
</template>

<style>
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.nav-menu {
  margin: 20px 0;
}

.nav-menu a {
  margin-right: 20px;
  text-decoration: none;
  color: #333;
  font-weight: bold;
}

.nav-menu a.router-link-active {
  color: #42b983;
}
</style>
