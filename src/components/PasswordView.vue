<template>
  <div class="password-view">
    <div class="password-container">
      <h1>KB 학생 관리 시스템</h1>
      <div class="password-input">
        <input
          type="password"
          v-model="password"
          placeholder="비밀번호를 입력하세요"
          @keyup.enter="checkPassword"
        />
        <button @click="checkPassword" class="btn">입력</button>
      </div>
      <p v-if="error" class="error-message">{{ error }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const password = ref("");
const error = ref("");

const checkPassword = () => {
  if (password.value === "9199") {
    localStorage.setItem("isAuthenticated", "true");
    router.push("/students");
  } else {
    error.value = "비밀번호가 틀렸습니다.";
    password.value = "";
  }
};
</script>

<style scoped>
.password-view {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f5f5f5;
}

.password-container {
  background: white;
  padding: 40px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.password-input {
  display: flex;
  gap: 10px;
  margin: 20px 0;
}

input {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
}

.btn {
  padding: 10px 20px;
  background-color: #2196f3;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
}

.error-message {
  color: #f44336;
  margin-top: 10px;
}
</style>
