<template>
  <div class="student-info">
    <div class="left-section">
      <div class="avatar">{{ student.name.charAt(0) }}</div>
    </div>
    <div class="right-section">
      <div class="student-name">{{ student.name }}</div>
      <div class="student-team" v-if="student.team">
        <span class="team-badge">{{ student.team }}</span>
      </div>
      <div class="student-team" v-else>
        <span class="no-team-badge">미배정</span>
      </div>
      <div class="student-details">
        <div class="student-email">
          <i class="email-icon">✉</i> {{ student.email }}
        </div>
        <div class="student-github">
          <i class="github-icon">🔗</i>
          <a :href="student.githubURL" target="_blank">GitHub</a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  student: {
    type: Object,
    required: true,
  },
});
</script>

<style scoped>
.student-info {
  display: flex;
  padding: 15px;
  border-radius: 10px;
  background-color: white;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.08);
  margin-bottom: 15px;
  transition: transform 0.2s, box-shadow 0.2s;
}

.student-info:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.left-section {
  margin-right: 15px;
}

.avatar {
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: bold;
}

.right-section {
  flex: 1;
}

.student-name {
  font-weight: bold;
  font-size: 18px;
  margin-bottom: 5px;
  color: #333;
}

.student-team {
  margin-bottom: 10px;
}

.team-badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 20px;
  background-color: rgba(76, 175, 80, 0.15);
  color: #4caf50;
  font-size: 12px;
  font-weight: 500;
}

.no-team-badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 20px;
  background-color: rgba(0, 0, 0, 0.05);
  color: #888;
  font-size: 12px;
  font-style: italic;
}

.student-details {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  font-size: 14px;
}

.student-email,
.student-github {
  display: flex;
  align-items: center;
  color: #666;
}

.email-icon,
.github-icon {
  margin-right: 5px;
  font-style: normal;
}

.student-github a {
  color: #2196f3;
  text-decoration: none;
  transition: color 0.2s;
}

.student-github a:hover {
  color: #0c7cd5;
  text-decoration: none;
}

@media (max-width: 500px) {
  .student-info {
    flex-direction: column;
  }

  .left-section {
    margin-right: 0;
    margin-bottom: 10px;
    display: flex;
    justify-content: center;
  }

  .student-details {
    flex-direction: column;
    gap: 8px;
  }
}
</style>
