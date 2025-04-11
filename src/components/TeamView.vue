<template>
  <div class="team-view">
    <h2>팀별 학생 목록</h2>
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useStudentStore } from "../stores/studentStore";

const studentStore = useStudentStore();
const loading = ref(true);

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
.team-view {
  padding: 20px;
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
</style>
