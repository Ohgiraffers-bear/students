<template>
  <div class="summary">
    <p>
      전체 학생 수: <strong>{{ studentStore.studentCount }}</strong
      >명
    </p>
  </div>
</template>

<script setup>
import { useStudentStore } from "../stores/studentStore";

const studentStore = useStudentStore();
</script>
