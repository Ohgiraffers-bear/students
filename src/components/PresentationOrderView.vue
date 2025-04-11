<template>
  <div class="presentation-order-view">
    <h2>발표 순서 뽑기</h2>

    <div v-if="loading" class="loading">로딩 중...</div>
    <div v-else>
      <div class="controls">
        <button
          @click="shuffleTeams"
          class="btn shuffle"
          :disabled="isShuffling"
        >
          {{ isShuffling ? "섞는 중..." : "순서 섞기" }}
        </button>
      </div>

      <div class="order-container">
        <div
          v-for="(order, index) in presentationOrder"
          :key="index"
          class="order-card"
        >
          <div class="order-number">{{ index + 1 }}번째</div>
          <div
            class="team-name"
            :class="{ flipped: order.isRevealed }"
            @click="revealTeam(index)"
          >
            <div class="card-front">
              <span>클릭하여 확인</span>
            </div>
            <div class="card-back">
              <span>{{ order.team }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useStudentStore } from "../stores/studentStore";

const studentStore = useStudentStore();
const loading = ref(true);
const isShuffling = ref(false);
const presentationOrder = ref([]);

// 팀 목록 가져오기
const teams = computed(() => {
  const teamSet = new Set();
  studentStore.students.forEach((student) => {
    if (student.team) {
      teamSet.add(student.team);
    }
  });
  return Array.from(teamSet);
});

// 팀 순서 섞기
const shuffleTeams = () => {
  isShuffling.value = true;

  // 모든 카드 뒤집기
  presentationOrder.value.forEach((order) => {
    order.isRevealed = false;
  });

  // 1초 후에 순서 섞기
  setTimeout(() => {
    const shuffledTeams = [...teams.value];
    for (let i = shuffledTeams.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledTeams[i], shuffledTeams[j]] = [
        shuffledTeams[j],
        shuffledTeams[i],
      ];
    }

    presentationOrder.value = shuffledTeams.map((team) => ({
      team,
      isRevealed: false,
    }));

    isShuffling.value = false;
  }, 1000);
};

// 팀 공개
const revealTeam = (index) => {
  if (!presentationOrder.value[index].isRevealed) {
    presentationOrder.value[index].isRevealed = true;
  }
};

onMounted(async () => {
  try {
    await studentStore.fetchStudents();
    shuffleTeams();
  } catch (error) {
    console.error("학생 데이터 로딩 실패:", error);
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.presentation-order-view {
  padding: 20px;
}

.controls {
  margin: 20px 0;
  display: flex;
  justify-content: center;
  gap: 10px;
}

.btn {
  padding: 12px 24px;
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

.shuffle {
  background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
  color: white;
}

.shuffle:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(37, 117, 252, 0.3);
}

.order-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-top: 30px;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.order-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  width: 100%;
}

.order-number {
  font-size: 18px;
  font-weight: bold;
  color: #333;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 8px 16px;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.team-name {
  width: 100%;
  height: 120px;
  perspective: 1000px;
  cursor: pointer;
  max-width: 400px;
}

.card-front,
.card-back {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
  transition: transform 0.6s;
}

.card-front {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  transform: rotateY(0deg);
}

.card-back {
  background: linear-gradient(135deg, #2196f3 0%, #1976d2 100%);
  color: white;
  transform: rotateY(180deg);
}

.team-name.flipped .card-front {
  transform: rotateY(180deg);
}

.team-name.flipped .card-back {
  transform: rotateY(0deg);
}

.loading {
  text-align: center;
  padding: 40px;
  color: #666;
  font-size: 16px;
}
</style>
