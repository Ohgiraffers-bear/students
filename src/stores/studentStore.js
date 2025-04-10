import { defineStore } from "pinia";
import { ref, computed } from "vue";
import apiClient from "../api/axios";

export const useStudentStore = defineStore("studentStore", () => {
  // 상태
  const students = ref([]);

  // 액션
  const fetchStudents = async () => {
    try {
      const response = await apiClient.get("/students");
      students.value = response.data;
    } catch (err) {
      console.error("학생 정보 로딩 에러:", err);
    }
  };

  // 컴퓨티드 속성
  const studentCount = computed(() => students.value.length);

  return {
    students,
    fetchStudents,
    studentCount,
  };
});
