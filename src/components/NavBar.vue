<template>
  <nav class="nav-bar">
    <div class="nav-links">
      <router-link to="/students" class="nav-link">학생 목록</router-link>
      <router-link to="/teams" class="nav-link">팀 관리</router-link>
      <router-link to="/teams/edit" class="nav-link">팀 편집</router-link>
      <router-link to="/teams/name-edit" class="nav-link"
        >팀 이름 수정</router-link
      >
      <router-link to="/presentation-order" class="nav-link"
        >발표 순서 뽑기</router-link
      >
    </div>
  </nav>
</template>

<script setup>
// 컴포넌트 로직이 필요한 경우 여기에 추가
</script>

<style scoped>
.nav-bar {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 15px 0;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.nav-links {
  display: flex;
  justify-content: center;
  gap: 20px;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.nav-link {
  color: #333;
  text-decoration: none;
  font-weight: 500;
  padding: 8px 16px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.nav-link:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

.nav-link.router-link-active {
  background: rgba(255, 255, 255, 0.3);
  font-weight: bold;
}

@media (max-width: 768px) {
  .nav-links {
    flex-direction: column;
    align-items: center;
    gap: 10px;
  }
}
</style>
