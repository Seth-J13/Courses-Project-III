<script setup>
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import courseServices from "../services/courseServices.js";
import Utils from "../config/utils.js";
import CourseForm from "../components/CoursesForm.vue";

const router = useRouter();

const emptyForm = () => ({
  courseId: "",
  courseName: "",
  semesterOffered: "",
  offeringFrequency: "",
  description: "",
});

const courses = ref([]);
const loading = ref(false);
const loadingCourses = ref(false);
const listError = ref("");
const formDialogOpen = ref(false);
const form = ref(emptyForm());
const formRef = ref(null);
const formError = ref("");
const saving = ref(false);
const deleteDialogOpen = ref(false);
const courseToDelete = ref(null);
const deleting = ref(false);
const isAdmin = computed(() => Utils.getStore("user")?.role === "admin");

const retrieveCourses = async () => {
  loading.value = true;
  listError.value = "";

  try {
    const [coursesResponse] = await Promise.all([
      courseServices.getCourses(),
    ]);
    courses.value = coursesResponse.data;
  } catch (error) {
    listError.value =
      error.response?.data?.message || "Failed to fetch courses.";
  } finally {
    loading.value = false;
  }
};

const openAddDialog = () => {
  form.value = emptyForm();
  formError.value = "";
  formDialogOpen.value = true;
};

const closeFormDialog = () => {
  formDialogOpen.value = false;
  formError.value = "";
};

const saveCourse = async () => {
  formError.value = "";
  const result = await formRef.value?.validate();

  if (!result?.valid) {
    return;
  }

  saving.value = true;

  try {
    await courseServices.createCourse({
      courseId: form.value.courseId.trim(),
      courseName: form.value.courseName.trim(),
      semesterOffered: form.value.semesterOffered.trim(),
      offeringFrequency: form.value.offeringFrequency.trim(),
      description: form.value.description.trim(),
    });
    closeFormDialog();
    await retrieveCourses();
  } catch (error) {
    formError.value =
      error.response?.data?.message || "Failed to create course.";
  } finally {
    saving.value = false;
  }
};

const openCourse = (course) => {
  form.value = {
    courseId: course.courseId,
    courseName: course.courseName,
    semesterOffered: course.semesterOffered,
    offeringFrequency: course.offeringFrequency,
    description: course.description,
  };
  formDialogOpen.value = true;
};

const openDeleteDialog = (course) => {
  courseToDelete.value = course;
  deleteDialogOpen.value = course;
};

const closeDeleteDialog = () => {
  deleteDialogOpen.value = false;
  courseToDelete.value = null;
};

const confirmDeleteCourse = async () => {
  if (!courseToDelete.value?.courseId) {
    return;
  }

  deleting.value = true;
  listError.value = "";

  try {
    await courseServices.deleteCourse(courseToDelete.value.courseId);
    closeDeleteDialog();
    await retrieveCourses();
  } catch (error) {
    listError.value =
      error.response?.data?.message || "Failed to delete course.";
  } finally {
    deleting.value = false;
  }
};

onMounted(retrieveCourses);
</script>

<template>
  <v-container class="py-8">
    <v-card rounded="lg">
      <v-card-item>
        <v-card-title>Courses</v-card-title>
        <template #append>
          <v-btn
            v-if="isAdmin"
            color="primary"
            variant="elevated"
            class="oc-cta"
            @click="openAddDialog"
          >
            + New course
          </v-btn>
        </template>
      </v-card-item>

      <v-card-text>
        <v-progress-linear v-if="loading" indeterminate class="mb-4" />

        <v-alert v-if="listError" type="error" density="compact" class="mb-4">
          {{ listError }}
        </v-alert>

        <p v-if="!loading && courses.length === 0" class="text-body-1">
          {{
            isAdmin
              ? "No courses yet. Create your first course."
              : "No courses assigned."
          }}
        </p>

        <v-table v-if="!loading && courses.length > 0">
          <thead>
            <tr>
              <th class="text-left">Course Id</th>
              <th class="text-left">Course Name</th>
              <th class="text-left">Semester Offered</th>
              <th class="text-left">Offer Frequency</th>
              <th class="text-left">Description</th>
              <th class="text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="course in courses" :key="course.courseId">
              <td>{{ course.courseId }}</td>
              <td>{{ course.courseName }}</td>
              <td>{{ course.semesterOffered }}</td>
              <td>{{ course.offeringFrequency }}</td>
              <td>{{ course.description }}</td>
              <td>
                <v-icon
                  size="small"
                  class="mx-4"
                  aria-label="Open course"
                  @click="openCourse(course)"
                >
                  mdi-account-group
                </v-icon>
                <v-icon
                  v-if="isAdmin"
                  size="small"
                  class="mx-4"
                  aria-label="Delete course"
                  @click="openDeleteDialog(course)"
                >
                  mdi-trash-can
                </v-icon>
              </td>
            </tr>
          </tbody>
        </v-table>
      </v-card-text>
    </v-card>

    <v-dialog v-model="formDialogOpen" max-width="520">
      <v-card rounded="lg">
        <v-card-title>Add Course</v-card-title>
        <v-card-text>
          <CourseForm ref="formRef" v-model="form" @submit="saveCourse" />
          <v-alert v-if="formError" type="error" density="compact" class="mt-2">
            {{ formError }}
          </v-alert>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="closeFormDialog">Cancel</v-btn>
          <v-btn
            color="primary"
            variant="elevated"
            class="oc-cta"
            :loading="saving"
            @click="saveCourse"
          >
            Create
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="formDialogOpen" max-width="520">
      <v-card rounded="lg">
        <v-card-title>Update Course</v-card-title>
        <v-card-text>
          <CourseForm ref="formRef" v-model="form" @submit="saveCourse" />
          <v-alert v-if="formError" type="error" density="compact" class="mt-2">
            {{ formError }}
          </v-alert>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="closeFormDialog">Cancel</v-btn>
          <v-btn
            color="primary"
            variant="elevated"
            class="oc-cta"
            :loading="saving"
            @click="saveCourse"
          >
            Update
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="deleteDialogOpen" max-width="420">
      <v-card rounded="lg">
        <v-card-title>Delete Course</v-card-title>
        <v-card-text>Delete this course?</v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="closeDeleteDialog">Cancel</v-btn>
          <v-btn
            color="primary"
            variant="elevated"
            class="oc-cta"
            :loading="deleting"
            @click="confirmDeleteCourse"
          >
            Delete Course
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>
