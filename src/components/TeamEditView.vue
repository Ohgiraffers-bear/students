<template>
  <div class="team-edit-view">
    <h2>팀 편집</h2>
    <div class="controls">
      <div class="team-count-control">
        <label for="teamCount">팀 수:</label>
        <input
          type="number"
          id="teamCount"
          v-model="teamCount"
          min="1"
          max="10"
          class="team-count-input"
        />
      </div>
      <button @click="randomizeTeams" class="btn randomize">
        팀 랜덤 배정
      </button>
      <button @click="showPasswordModal" class="btn save" :disabled="isSaving">
        {{ isSaving ? "저장 중..." : "변경사항 저장" }}
      </button>
    </div>

    <div v-if="loading" class="loading">로딩 중...</div>
    <div v-else class="teams-container">
      <div
        v-for="teamName in sortedTeamNames"
        :key="teamName"
        class="team-card"
      >
        <h3>{{ teamName }}</h3>
        <ul class="student-list">
          <li
            v-for="student in groupedStudents[teamName]"
            :key="student.id"
            class="student-item"
          >
            {{ student.name }}
          </li>
        </ul>
      </div>
    </div>

    <!-- 비밀번호 입력 모달 -->
    <div v-if="showModal" class="modal">
      <div class="modal-content">
        <h3 class="modal-title">비밀번호 입력</h3>
        <div class="password-input-container">
          <input
            type="password"
            v-model="savePassword"
            placeholder="저장 비밀번호를 입력하세요"
            class="password-input"
            @keyup.enter="confirmSave"
          />
        </div>
        <div class="modal-buttons">
          <button @click="confirmSave" class="modal-btn confirm">확인</button>
          <button @click="cancelSave" class="modal-btn cancel">취소</button>
        </div>
        <p v-if="passwordError" class="error-message">{{ passwordError }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useStudentStore } from "../stores/studentStore";
import apiClient from "../api/axios";

const studentStore = useStudentStore();
const loading = ref(true);
const isSaving = ref(false);
const teamCount = ref(5);
const showModal = ref(false);
const savePassword = ref("");
const passwordError = ref("");

// 사용 가능한 팀 목록을 computed로 변경
const availableTeams = computed(() => {
  return Array.from({ length: teamCount.value }, (_, i) => `${i + 1}팀`);
});

const groupedStudents = computed(() => {
  const groups = {};
  studentStore.students.forEach((student) => {
    const teamName = student.team || "미배정";
    if (!groups[teamName]) {
      groups[teamName] = [];
    }
    groups[teamName].push(student);
  });
  return groups;
});

// 팀 이름을 순서대로 정렬
const sortedTeamNames = computed(() => {
  // 학생이 배정된 팀만 표시
  const teamNames = Object.keys(groupedStudents.value).filter(
    (teamName) => groupedStudents.value[teamName].length > 0
  );

  return teamNames.sort((a, b) => {
    // 미배정은 항상 마지막에 표시
    if (a === "미배정") return 1;
    if (b === "미배정") return -1;

    // 숫자 팀인지 확인 (예: "1팀", "2팀")
    const isANumberTeam = /^\d+팀$/.test(a);
    const isBNumberTeam = /^\d+팀$/.test(b);

    // 둘 다 숫자 팀이면 숫자 기준으로 정렬
    if (isANumberTeam && isBNumberTeam) {
      const numA = parseInt(a);
      const numB = parseInt(b);
      return numA - numB;
    }

    // 숫자 팀이 먼저 오도록
    if (isANumberTeam) return -1;
    if (isBNumberTeam) return 1;

    // 둘 다 커스텀 이름이면 알파벳 순서로 정렬
    return a.localeCompare(b);
  });
});

// 팀 수가 변경될 때마다 팀 목록 업데이트
watch(teamCount, () => {
  // 팀 수가 줄어들면 해당 팀의 학생들을 미배정으로 변경
  studentStore.students.forEach((student) => {
    if (student.team) {
      // 숫자 팀 패턴 확인 (예: "1팀")
      const match = student.team.match(/^(\d+)팀$/);
      if (match) {
        const teamNumber = parseInt(match[1]);
        if (teamNumber > teamCount.value) {
          student.team = "";
        }
      }
    }
  });
});

// 팀 랜덤 배정 (균등하게 배정)
const randomizeTeams = () => {
  const students = [...studentStore.students];
  const teams = availableTeams.value;

  // 학생들을 랜덤하게 섞기
  for (let i = students.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [students[i], students[j]] = [students[j], students[i]];
  }

  // 각 팀에 균등하게 배정
  students.forEach((student, index) => {
    student.team = teams[index % teams.length];
  });
};

// 비밀번호 입력 모달 표시
const showPasswordModal = () => {
  showModal.value = true;
  savePassword.value = "";
  passwordError.value = "";
};

// 저장 취소
const cancelSave = () => {
  showModal.value = false;
  savePassword.value = "";
  passwordError.value = "";
};

// 저장 확인
const confirmSave = async () => {
  if (savePassword.value !== "8238") {
    passwordError.value = "비밀번호가 틀렸습니다.";
    savePassword.value = "";
    return;
  }

  isSaving.value = true;
  showModal.value = false;
  try {
    const updatePromises = studentStore.students.map((student) =>
      apiClient.patch(`/students/${student.id}`, {
        team: student.team,
      })
    );

    await Promise.all(updatePromises);
    alert("변경사항이 저장되었습니다.");
  } catch (error) {
    console.error("저장 실패:", error);
    alert("저장 중 오류가 발생했습니다.");
  } finally {
    isSaving.value = false;
    savePassword.value = "";
  }
};

onMounted(async () => {
  try {
    await studentStore.fetchStudents();
  } catch (error) {
    console.error("학생 데이터 로딩 실패:", error);
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.team-edit-view {
  padding: 20px;
}

.controls {
  margin: 20px 0;
  display: flex;
  gap: 15px;
  align-items: center;
}

.team-count-control {
  display: flex;
  align-items: center;
  gap: 10px;
  background: white;
  padding: 5px 15px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.team-count-control label {
  font-weight: 500;
  color: #333;
}

.team-count-input {
  width: 60px;
  padding: 8px;
  border: none;
  border-radius: 4px;
  background-color: rgba(0, 0, 0, 0.03);
  text-align: center;
  font-size: 14px;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.randomize {
  background: linear-gradient(135deg, #43a047 0%, #2e7d32 100%);
  color: white;
}

.randomize:hover {
  background: linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(46, 125, 50, 0.3);
}

.save {
  background: linear-gradient(135deg, #2196f3 0%, #1976d2 100%);
  color: white;
}

.save:hover {
  background: linear-gradient(135deg, #1976d2 0%, #0d47a1 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(25, 118, 210, 0.3);
}

.teams-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.team-card {
  background: white;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.08);
  transition: transform 0.2s, box-shadow 0.2s;
}

.team-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.team-card h3 {
  margin: 0 0 15px 0;
  color: #333;
  font-size: 18px;
  position: relative;
  padding-bottom: 10px;
}

.team-card h3::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 0;
  width: 40px;
  height: 3px;
  background: linear-gradient(90deg, #6a11cb 0%, #2575fc 100%);
  border-radius: 2px;
}

.student-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.student-item {
  padding: 10px;
  margin: 8px 0;
  background: rgba(0, 0, 0, 0.02);
  border-radius: 6px;
  transition: background-color 0.2s;
}

.student-item:hover {
  background: rgba(0, 0, 0, 0.04);
}

.loading {
  text-align: center;
  padding: 40px;
  color: #666;
  font-size: 16px;
}

/* 모달 스타일 */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
}

.modal-content {
  background: white;
  width: 350px;
  max-width: 90%;
  border-radius: 12px;
  box-shadow: 0 5px 25px rgba(0, 0, 0, 0.15);
  overflow: hidden;
}

.modal-title {
  color: #333;
  font-size: 18px;
  text-align: center;
  margin: 0;
  padding: 20px 0;
  position: relative;
}

.modal-title::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 40px;
  height: 3px;
  background: linear-gradient(90deg, #6a11cb 0%, #2575fc 100%);
  border-radius: 2px;
}

.password-input-container {
  padding: 25px 20px;
  display: flex;
  justify-content: center;
}

.password-input {
  width: 100%;
  padding: 12px 15px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  background-color: rgba(0, 0, 0, 0.03);
  box-sizing: border-box;
}

.modal-buttons {
  display: flex;
}

.modal-btn {
  flex: 1;
  padding: 15px;
  border: none;
  cursor: pointer;
  font-weight: 500;
  font-size: 15px;
  transition: background-color 0.3s;
}

.modal-btn.confirm {
  background: linear-gradient(135deg, #2196f3 0%, #1976d2 100%);
  color: white;
}

.modal-btn.confirm:hover {
  background: linear-gradient(135deg, #1976d2 0%, #0d47a1 100%);
}

.modal-btn.cancel {
  background: linear-gradient(135deg, #f44336 0%, #d32f2f 100%);
  color: white;
}

.modal-btn.cancel:hover {
  background: linear-gradient(135deg, #d32f2f 0%, #b71c1c 100%);
}

.error-message {
  color: #f44336;
  text-align: center;
  margin: 8px 0;
  font-size: 14px;
  padding: 0 15px 20px;
}
</style>
