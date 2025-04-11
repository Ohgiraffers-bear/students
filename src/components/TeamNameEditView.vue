<template>
  <div class="team-name-edit-view">
    <h2>팀 이름 수정</h2>
    <div class="controls">
      <button @click="showPasswordModal" class="btn save" :disabled="isSaving">
        {{ isSaving ? "저장 중..." : "변경사항 저장" }}
      </button>
    </div>

    <div v-if="loading" class="loading">로딩 중...</div>
    <div v-else class="teams-container">
      <div v-for="(team, index) in teamNames" :key="index" class="team-card">
        <div class="team-name-header">
          <span class="team-label">{{ team.oldName }}</span>
          <button @click="toggleEditMode(index)" class="edit-btn">
            {{ team.isEditing ? "취소" : "이름 변경" }}
          </button>
        </div>

        <div v-if="team.isEditing" class="team-name-edit">
          <input
            type="text"
            v-model="team.newName"
            class="team-name-input"
            :placeholder="`새 팀 이름 입력`"
            ref="nameInput"
            @keyup.enter="saveTeamName(index)"
          />
          <button @click="saveTeamName(index)" class="save-btn">저장</button>
        </div>

        <div
          class="team-members"
          v-if="
            teamStudents[team.oldName] && teamStudents[team.oldName].length > 0
          "
        >
          <h4>소속 학생</h4>
          <ul class="student-list">
            <li
              v-for="student in teamStudents[team.oldName]"
              :key="student.id"
              class="student-item"
            >
              {{ student.name }}
            </li>
          </ul>
        </div>
        <div v-else class="no-students">
          <p>소속 학생이 없습니다.</p>
        </div>
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
import { ref, computed, onMounted, nextTick } from "vue";
import { useStudentStore } from "../stores/studentStore";
import apiClient from "../api/axios";

const studentStore = useStudentStore();
const loading = ref(true);
const isSaving = ref(false);
const showModal = ref(false);
const savePassword = ref("");
const passwordError = ref("");
const teamCount = ref(5);
const nameInput = ref(null);

// 팀 이름 목록 - 초기에는 기본 이름(1팀, 2팀 등)으로 설정
const teamNames = ref([]);

// 팀별 학생 목록 - 모든 팀 이름을 포함하도록 수정
const teamStudents = computed(() => {
  const groups = {};

  // 먼저 모든 teamNames의 oldName에 해당하는 키를 만들어 놓음
  teamNames.value.forEach((team) => {
    groups[team.oldName] = [];
  });

  // 학생들을 해당 팀에 할당
  studentStore.students.forEach((student) => {
    const teamName = student.team || "미배정";
    if (!groups[teamName]) {
      groups[teamName] = [];
    }
    groups[teamName].push(student);
  });

  return groups;
});

// 편집 모드 토글
const toggleEditMode = async (index) => {
  // 다른 모든 팀의 편집 모드를 비활성화
  teamNames.value.forEach((team, i) => {
    if (i !== index) {
      team.isEditing = false;
    }
  });

  // 현재 팀의 편집 모드 토글
  teamNames.value[index].isEditing = !teamNames.value[index].isEditing;

  // 편집 모드가 활성화되었다면 input에 포커스
  if (teamNames.value[index].isEditing) {
    await nextTick();
    if (nameInput.value && nameInput.value.length > 0) {
      nameInput.value[0].focus();
    }
  }
};

// 팀 이름 저장
const saveTeamName = async (index) => {
  const team = teamNames.value[index];
  let newName = team.newName.trim();

  // 백슬래시를 원표시로 변환
  newName = newName.replace(/\\/g, "₩");

  if (!newName) {
    alert("팀 이름을 입력해주세요.");
    return;
  }

  const oldTeamName = team.oldName;

  try {
    // 해당 팀의 학생들 찾기
    const studentsInTeam = studentStore.students.filter(
      (student) => student.team === oldTeamName
    );

    // 학생들의 팀 이름 업데이트
    const updatePromises = studentsInTeam.map((student) =>
      apiClient.patch(`/students/${student.id}`, {
        team: newName,
      })
    );

    await Promise.all(updatePromises);

    // 학생 정보 새로고침
    await studentStore.fetchStudents();

    // 팀 이름이 변경된 것을 알림
    alert(`${oldTeamName}의 이름이 ${newName}으로 변경되었습니다.`);

    // 팀 이름 입력 필드 초기화 전에 화면을 갱신하기 위해
    // 현재 변경된 팀 정보 업데이트
    const currentTeam = teamNames.value[index];
    currentTeam.isEditing = false;
    // 이전 oldName을 가진 학생들은 이제 newName을 가짐

    // teamNames 목록 전체를 갱신
    updateTeamNames();
  } catch (error) {
    console.error("저장 실패:", error);
    alert("저장 중 오류가 발생했습니다.");
  }
};

// 팀 이름 목록 업데이트
const updateTeamNames = () => {
  // 사용 중인 팀 이름 찾기 (변경 후 이름 포함)
  const currentTeams = new Set();

  // 현재 학생들이 속한 모든 팀 수집
  studentStore.students.forEach((student) => {
    if (student.team) {
      currentTeams.add(student.team);
    }
  });

  // 팀 배열을 새로 구성
  const newTeamNames = [];

  // 모든 팀을 추가 (숫자 팀과 커스텀 팀 모두)
  Array.from(currentTeams).forEach((team) => {
    // 해당 팀에 학생이 있는 경우에만 추가
    if (teamStudents.value[team] && teamStudents.value[team].length > 0) {
      newTeamNames.push({
        oldName: team,
        newName: "",
        isEditing: false,
      });
    }
  });

  // 팀 정렬: 숫자 팀 먼저, 그 다음 커스텀 팀
  newTeamNames.sort((a, b) => {
    const isANumberTeam = /^\d+팀$/.test(a.oldName);
    const isBNumberTeam = /^\d+팀$/.test(b.oldName);

    // 둘 다 숫자 팀이면 숫자 기준으로 정렬
    if (isANumberTeam && isBNumberTeam) {
      const numA = parseInt(a.oldName);
      const numB = parseInt(b.oldName);
      return numA - numB;
    }

    // 숫자 팀이 먼저 오도록
    if (isANumberTeam) return -1;
    if (isBNumberTeam) return 1;

    // 둘 다 커스텀 이름이면 알파벳 순서로 정렬
    return a.oldName.localeCompare(b.oldName);
  });

  // 업데이트
  teamNames.value = newTeamNames;
};

// 비밀번호 입력 모달 표시
const showPasswordModal = () => {
  // 변경된 팀 이름이 있는지 확인
  const changedTeams = teamNames.value.filter(
    (team) => team.newName.trim() !== "" && !team.isEditing
  );

  if (changedTeams.length === 0) {
    alert("변경된 팀 이름이 없습니다.");
    return;
  }

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

// 초기화 함수
const initTeamNames = () => {
  updateTeamNames();
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

  const changedTeams = teamNames.value.filter(
    (team) => team.newName.trim() !== "" && !team.isEditing
  );

  try {
    // 팀 이름 변경이 있는 학생 정보만 업데이트
    for (const team of changedTeams) {
      const oldTeamName = team.oldName;
      let newTeamName = team.newName.trim();

      // 백슬래시를 원표시로 변환
      newTeamName = newTeamName.replace(/\\/g, "₩");

      // 해당 팀의 학생들 찾기
      const studentsInTeam = studentStore.students.filter(
        (student) => student.team === oldTeamName
      );

      // 학생들의 팀 이름 업데이트
      const updatePromises = studentsInTeam.map((student) =>
        apiClient.patch(`/students/${student.id}`, {
          team: newTeamName,
        })
      );

      await Promise.all(updatePromises);
    }

    // 학생 정보 새로고침
    await studentStore.fetchStudents();

    // 팀 이름 목록 업데이트
    updateTeamNames();

    alert("팀 이름이 변경되었습니다.");
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
    initTeamNames();
  } catch (error) {
    console.error("학생 데이터 로딩 실패:", error);
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.team-name-edit-view {
  padding: 20px;
}

.controls {
  margin: 20px 0;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
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
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
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

.team-name-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  position: relative;
  padding-bottom: 10px;
}

.team-name-header::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 0;
  width: 40px;
  height: 3px;
  background: linear-gradient(90deg, #6a11cb 0%, #2575fc 100%);
  border-radius: 2px;
}

.team-label {
  font-weight: bold;
  font-size: 18px;
  color: #333;
}

.edit-btn {
  padding: 6px 12px;
  background: linear-gradient(135deg, #43a047 0%, #2e7d32 100%);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.3s;
  box-shadow: 0 2px 5px rgba(46, 125, 50, 0.2);
}

.edit-btn:hover {
  background: linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%);
  transform: translateY(-2px);
  box-shadow: 0 3px 8px rgba(46, 125, 50, 0.3);
}

.team-name-edit {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
  gap: 10px;
}

.team-name-input {
  flex: 1;
  padding: 10px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  background-color: rgba(0, 0, 0, 0.03);
}

.save-btn {
  padding: 8px 12px;
  background: linear-gradient(135deg, #2196f3 0%, #1976d2 100%);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.3s;
  box-shadow: 0 2px 5px rgba(33, 150, 243, 0.2);
}

.save-btn:hover {
  background: linear-gradient(135deg, #1976d2 0%, #0d47a1 100%);
  transform: translateY(-2px);
  box-shadow: 0 3px 8px rgba(33, 150, 243, 0.3);
}

.team-members h4 {
  margin: 15px 0 10px 0;
  color: #555;
  font-size: 15px;
  position: relative;
  padding-bottom: 8px;
}

.team-members h4::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 0;
  width: 20px;
  height: 2px;
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

.no-students {
  margin-top: 10px;
  color: #999;
  font-style: italic;
  text-align: center;
  padding: 15px;
  background: rgba(0, 0, 0, 0.02);
  border-radius: 6px;
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
