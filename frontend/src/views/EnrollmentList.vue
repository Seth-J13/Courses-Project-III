<script setup>
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import enrollmentServices from "../services/enrollmentServices.js";
import Utils from "../config/utils.js";
import { toDateInputValue, formatDueDate } from "../config/validation.js";

const router = useRouter();

const emptyForm = () => ({
  name: "",
  startDate: "",
  endDate: "",
  leagueId: null,
  gameDays: [],
  gameTime: "",
  minDaysBetweenGames: "",
});

const enrollments = ref([]);
const loading = ref(false);
const listError = ref("");
const formDialogOpen = ref(false);
const isAddMode = ref(true);
const form = ref(emptyForm());
const formError = ref("");
const saving = ref(false);
const editingId = ref(null);
const deleteDialogOpen = ref(false);
const enrollmentToDelete = ref(null);
const deleting = ref(false);

const formTitle = computed(() =>
  isAddMode.value ? "Add Enrollment" : "Edit Enrollment"
);
const saveLabel = computed(() =>
  isAddMode.value ? "Create" : "Save Enrollment"
);

const calcCurrentSemester = () => {
  let season = ''
  
  if (new Date() === 12)
    season = 'SP'
  else if (new Date().getMonth() > 11)
    season = 'WI'
  else if (new Date().getMonth() > 7)
    season = 'FA'
  else if (new Date().getMonth() > 4)
    season = 'SU'
  else
    season = 'SP'

  return season + `${new Date().getFullYear()}`
}

const formatTime = (time) => {
  let hour = time.substring(0,2)
  let minute = time.substring(3,5)
  let suffix = `AM`
  
  if (parseInt(hour) >= 12)
  suffix = `PM`
else if (parseInt(hour) > 12)
hour = hour - 12

return hour + `:` + minute + suffix
}

const getSearchParams = () => new URLSearchParams(window.location.search)

const retrieveEnrollmentsThisSemester = async () => {
  loading.value = true;
  listError.value = "";

  try {
    let semester = (!Utils.getStore('lastSemChecked')) ? calcCurrentSemester() : Utils.getStore('lastSemChecked')
    Utils.setStore('lastSemChecked', semester)
    
    // get the semester argument from the search bar if it exists, otherwise get the most recently-visited one
    let sem = getSearchParams().get('semester')
    if (sem) {
      semester = sem
      Utils.setStore('lastSemChecked', semester)
    }
    else
      semester = Utils.getStore('lastSemChecked')
    
    // if there weren't any parameters, update the search bar to include parameters
    let query = window.location.search
    if (!query)
      history.pushState(null, '', window.location.href + `?semester=${semester}`)

    const enrollmentResponse = await enrollmentServices.getEnrollments(Utils.getStore('user').id, semester)
    enrollments.value = enrollmentResponse.data;
  } catch (error) {
    listError.value =
      error.response?.data?.message || "Failed to fetch enrollments.";
  } finally {
    loading.value = false;
  }
};

const openAddDialog = () => {
  isAddMode.value = true;
  editingId.value = null;
  form.value = emptyForm();
  formError.value = "";
  formDialogOpen.value = true;
};

const closeFormDialog = () => {
  formDialogOpen.value = false;
  formError.value = "";
  editingId.value = null;
};

const openEnrollment = (enrollment) => {
  router.push({ name: "enrollment", params: { enrollmentId: enrollment.id } });
};

const openDeleteDialog = (enrollment) => {
  enrollmentToDelete.value = enrollment;
  deleteDialogOpen.value = true;
};

const closeDeleteDialog = () => {
  deleteDialogOpen.value = false;
  enrollmentToDelete.value = null;
};

const confirmDeleteEnrollment = async () => {
  if (!enrollmentToDelete.value?.id) {
    return;
  }

  deleting.value = true;
  listError.value = "";

  try {
    await enrollmentServices.deleteEnrollment(enrollmentToDelete.value.id);
    closeDeleteDialog();
    await retrieveEnrollmentsThisSemester();
  } catch (error) {
    listError.value =
      error.response?.data?.message || "Failed to delete enrollment.";
  } finally {
    deleting.value = false;
  }
};

onMounted(retrieveEnrollmentsThisSemester);
</script>

<template>
  <v-container class="py-8">
    <v-card rounded="lg">
      <v-card-item>
        <v-card-title>Enrollments - {{ getSearchParams().get('semester') }}</v-card-title>
        <template #append>
          <v-btn
            color="primary"
            variant="elevated"
            class="oc-cta"
            @click="openAddDialog"
          >
            + New enrollment
          </v-btn>
        </template>
      </v-card-item>

      <v-card-text>
        <v-progress-linear v-if="loading" indeterminate class="mb-4" />

        <v-alert
          v-if="listError"
          type="error"
          density="compact"
          class="mb-4"
        >
          {{ listError }}
        </v-alert>

        <p v-if="!loading && enrollments.length === 0" class="text-body-1">
          No enrollments yet. Create your first enrollment.
        </p>

        <v-table v-if="!loading && enrollments.length > 0">
          <thead>
            <tr>
              <th class="text-left">SectionId</th>
              <th class="text-left">Name</th>
              <th class="text-left">Days</th>
              <th class="text-left">Time</th>
              <th class="text-left">Room</th>
              <th class="text-left">Instructor</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="enrollment in enrollments" :key="enrollment.sectionId">
              <td>{{ enrollment.section.sectionId }}</td>
              <td> testName until later</td>
              <td>{{ enrollment.section.dayOfWeek }}</td>
              <td>{{ formatTime(enrollment.section.timeStart) }} - {{ formatTime(enrollment.section.timeEnd) }}</td>
              <td>{{ enrollment.section.roomNum }}</td>
              <td>{{ enrollment.section.facultyId }}</td>
              <td>
                <v-icon
                  size="small"
                  class="mx-4"
                  aria-label="Open enrollment"
                  @click="openEnrollment(enrollment)"
                >
                  mdi-calendar
                </v-icon>
                <v-icon
                  size="small"
                  class="mx-4"
                  aria-label="Edit enrollment"
                  @click="openEditDialog(enrollment)"
                >
                  mdi-pencil
                </v-icon>
                <v-icon
                  size="small"
                  class="mx-4"
                  aria-label="Delete enrollment"
                  @click="openDeleteDialog(enrollment)"
                >
                  mdi-trash-can
                </v-icon>
              </td>
            </tr>
          </tbody>
        </v-table>
      </v-card-text>
    </v-card>

    <v-dialog v-model="formDialogOpen" max-width="560">
      <v-card rounded="lg">
        <v-card-title>{{ formTitle }}</v-card-title>
        <v-card-text>
          <!-- <EnrollmentForm
            ref="formRef"
            v-model="form"
            :leagues="leagues"
            @submit="saveEnrollment"
          /> This was the old enrollment form, not needed for courses-->
          <v-alert
            v-if="formError"
            type="error"
            density="compact"
            class="mt-2"
          >
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
            @click="saveEnrollment"
          >
            {{ saveLabel }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="deleteDialogOpen" max-width="420">
      <v-card rounded="lg">
        <v-card-title>Delete Enrollment</v-card-title>
        <v-card-text>Delete this enrollment?</v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="closeDeleteDialog">Cancel</v-btn>
          <v-btn
            color="primary"
            variant="elevated"
            class="oc-cta"
            :loading="deleting"
            @click="confirmDeleteEnrollment"
          >
            Delete Enrollment
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>
