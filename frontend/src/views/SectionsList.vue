<script setup>
import { computed, onMounted, ref } from "vue";
import Utils from "../config/utils.js";
import sectionServices from "../services/sectionServices.js";
import facultyServices from "../services/facultyServices.js";
import courseServices from "../services/courseServices.js";

const faculties = ref([]);
const courses = ref([]);

const loadFaculties = async () => {
  const response = await facultyServices.getFaculty();
  faculties.value = response.data;
  faculties.value = faculties.value.map(faculty => faculty.fName + " " + faculty.lName + " (" + faculty.facultyId + ")");
};

const loadCourses = async () => {
  const response = await courseServices.getCourses();
  courses.value = response.data;
};

const isAdmin = computed(() => Utils.getStore("user")?.role === "admin");

const emptyForm = () => ({
  courseId: "",
  sectionId: "",
  facultyId: "",
  dayOfWeek: "",
  roomNum: "",
  timeStart: "",
  timeEnd: "",
});

const sections = ref([]);
const filters = ref(emptyForm());
const form = ref(emptyForm());
const loading = ref(false);
const saving = ref(false);
const listError = ref(null);
const formError = ref(null);
const dialogOpen = ref(false);
const editingId = ref(null);

const loadSections = async () => {
  loading.value = true;
  listError.value = "";
  try {
    const response = await sectionServices.getSections({
    courseId: filters.value.courseId|| undefined,
    facultyId: filters.value.facultyId|| undefined,
    dayOfWeek: filters.value.dayOfWeek|| undefined,
    roomNum: filters.value.roomNum|| undefined,
    timeStart: filters.value.timeStart|| undefined,
    timeEnd: filters.value.timeEnd|| undefined,
    });
    sections.value = Array.isArray(response.data) ? response.data : [];
      } catch (error) {
    listError.value = error.response?.data?.message || "Failed to fetch sections.";
  } finally {
    loading.value = false;
  }
};

const openAdd = () => {
  editingId.value = null;
  form.value = emptyForm();
  formError.value = null;
  dialogOpen.value = true;

  loadFaculties();
  loadCourses();
};

const openEdit = (section) => {
  editingId.value = section.sectionId;
  form.value = {
    courseId: section.courseId,
    facultyId: section.facultyId,
    dayOfWeek: section.dayOfWeek,
    roomNum: section.roomNum,
    timeStart: section.timeStart,
    timeEnd: section.timeEnd,
  };
  formError.value = "";
  dialogOpen.value = true;
};

const saveSection = async () => {
  saving.value = true;
  formError.value = "";

  form.value = {
    courseId: form.value.courseId,
    sectionId: form.value.sectionId,
    facultyId: form.value.facultyId.substring(form.value.facultyId.indexOf("(")+1,form.value.facultyId.indexOf(")")),
    dayOfWeek: form.value.dayOfWeek.join(''),
    roomNum: form.value.roomNum,
    timeStart: form.value.timeStart,
    timeEnd: form.value.timeEnd,
  };
  try {
    if (editingId.value) {
      await sectionServices.updateSection(editingId.value, form.value);
    } else {
      await sectionServices.createSection(form.value);
    }
    dialogOpen.value = false;
    await loadSections();
  } catch (error) {
    formError.value = error.response?.data?.message || "Failed to save section.";  
  } finally {
    saving.value = false;
  }
};

const deleteSection = async (id) => {
  try {
    await sectionServices.deleteSection(id);
    await loadSections();
  } catch (error) {
    listError.value = error.message;
  }
};

onMounted(() => {
  if (isAdmin.value) {
    loadSections();
  }
});

</script>


<template>
  <V-alert v-if="!isAdmin" type="error">Access denied</V-alert>

  <template v-else>
    <v-card rounded="lg">
      <v-card-item>
        <v-card-title>Section Management</v-card-title>
      <template #append>
        <v-btn color="primary" @click="openAdd">Add Section</v-btn>
        </template>
      </v-card-item>
      <v-card-text>
        <v-row>
          <v-col cols="12" md="6">
            <v-text-field v-model="filters.courseId" label="Course ID" density="comfortable" />
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field v-model="filters.facultyId" label="Faculty ID" density="comfortable" />
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field v-model="filters.dayOfWeek" label="Day of Week" density="comfortable" />
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field v-model="filters.roomNum" label="Room Number" density="comfortable" />
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field v-model="filters.timeStart" label="Start Time" density="comfortable" />
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field v-model="filters.timeEnd" label="End Time" density="comfortable" />
          </v-col>
        </v-row>
          <v-btn color="primary" @click="loadSections">Apply Filters</v-btn>
          
          <v-progress-linear v-if="loading" indeterminate color="primary" />
          <v-alert v-if="listError" type="error" density="compact" class="mb-4">{{ listError }}</v-alert>

          <p v-if="!loading && sections.length === 0">No sections match these filters.</p>

          <v-table v-if="sections.length > 0">            
            <thead>
              <tr>
                <th class="text-left">Courses</th>
                <th class="text-left">Faculty</th>
                <th class="text-left">Day</th>
                <th class="text-left">Room</th>
                <th class="text-left">Start Time</th>
                <th class="text-left">End Time</th>
                <th class="text-left">Section Code</th>
                <th class="text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="section in sections" :key="section.sectionId">
                <td>{{ section.courseId }}</td>
                <td>{{ section.facultyId }}</td>
                <td>{{ section.dayOfWeek }}</td>
                <td>{{ section.roomNum }}</td>
                <td>{{ section.timeStart }}</td>
                <td>{{ section.timeEnd }}</td>
                <td>{{ section.sectionId }}</td>
                <td>
                  <v-icon variant="text" aria-label="Edit section" @click="openEdit(section)">mdi-pencil</v-icon>
                  <v-icon variant="text" aria-label="Delete section" @click="deleteSection(section.sectionId)">mdi-delete</v-icon>
                </td>
              </tr>
            </tbody>
          </v-table>
        </v-card-text>
      </v-card>

      <v-dialog v-model="dialogOpen" max-width="500">
        <v-card rounded="lg">
          <v-card-title>{{ editingId ? 'Edit Section' : 'Add Section' }}</v-card-title>
          <v-card-text>
            <p v-if="editingId">{{ editingId }}</p>
              <v-text-field v-model="form.courseId" label="Course ID" density="comfortable" @update:model-value="form.sectionId = form.courseId + '-'" />
              <v-text-field v-model="form.sectionId" label="Section ID" density="comfortable" />
              <v-combobox v-model="form.facultyId" label="Faculty ID" density="comfortable" :items="faculties" item-title="facultyName" item-value="facultyId" />
              <v-select v-model="form.dayOfWeek" label="Day of Week" density="comfortable" :items="['', 'M', 'T', 'W', 'TH', 'F']" multiple />
              <v-text-field v-model="form.roomNum" label="Room Number" density="comfortable" />
              <v-text-field v-model="form.timeStart" label="Start Time" density="comfortable" />
              <v-text-field v-model="form.timeEnd" label="End Time" density="comfortable" />
              <v-alert v-if="formError" type="error" density="compact" class="mb-4">{{ formError }}</v-alert>
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn variant="text" @click="dialogOpen = false">Cancel</v-btn>
            <v-btn color="primary" variant="elevated" class="oc-cta" :loading="saving" @click="saveSection">Save</v-btn>
          </v-card-actions>
            </v-card>
          </v-dialog>
    </template>
</template>