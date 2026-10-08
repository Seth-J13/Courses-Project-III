<script setup>
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import teamServices from "../services/teamServices.js";
import leagueServices from "../services/leagueServices.js";
import peopleServices from "../services/peopleServices.js";
import Utils from "../config/utils.js";

const router = useRouter();

const emptyForm = () => ({
  name: "",
  leagueId: null,
  homeField: "",
  managerId: null,
});

const teams = ref([]);
const leagues = ref([]);
const people = ref([]);
const loading = ref(false);
const listError = ref("");
const formDialogOpen = ref(false);
const form = ref(emptyForm());
const formRef = ref(null);
const formError = ref("");
const saving = ref(false);
const deleteDialogOpen = ref(false);
const teamToDelete = ref(null);
const deleting = ref(false);
const isAdmin = computed(() => Utils.getStore("user")?.role === "admin");

const retrieveTeams = async () => {
  loading.value = true;
  listError.value = "";

  try {
    const [teamsResponse, leaguesResponse, peopleResponse] = await Promise.all([
      teamServices.getTeams(),
      leagueServices.getLeagues(),
      peopleServices.getPeople(),
    ]);
    teams.value = teamsResponse.data;
    leagues.value = leaguesResponse.data;
    people.value = peopleResponse.data;
  } catch (error) {
    listError.value =
      error.response?.data?.message || "Failed to fetch teams.";
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

const saveTeam = async () => {
  formError.value = "";
  const result = await formRef.value?.validate();

  if (!result?.valid) {
    return;
  }

  saving.value = true;

  try {
    await teamServices.createTeam({
      name: form.value.name.trim(),
      leagueId: form.value.leagueId,
      homeField: form.value.homeField.trim(),
      managerId: form.value.managerId || null,
    });
    closeFormDialog();
    await retrieveTeams();
  } catch (error) {
    formError.value =
      error.response?.data?.message || "Failed to create team.";
  } finally {
    saving.value = false;
  }
};

const openTeam = (team) => {
  router.push({ name: "team", params: { teamId: team.id } });
};

const openDeleteDialog = (team) => {
  teamToDelete.value = team;
  deleteDialogOpen.value = true;
};

const closeDeleteDialog = () => {
  deleteDialogOpen.value = false;
  teamToDelete.value = null;
};

const confirmDeleteTeam = async () => {
  if (!teamToDelete.value?.id) {
    return;
  }

  deleting.value = true;
  listError.value = "";

  try {
    await teamServices.deleteTeam(teamToDelete.value.id);
    closeDeleteDialog();
    await retrieveTeams();
  } catch (error) {
    listError.value =
      error.response?.data?.message || "Failed to delete team.";
  } finally {
    deleting.value = false;
  }
};

onMounted(retrieveTeams);
</script>

<template>
  <v-container class="py-8">
    <v-card rounded="lg">
      <v-card-item>
        <v-card-title>Teams</v-card-title>
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
              <th class="text-left">Name</th>
              <th class="text-left">Description</th>
              <th class="text-left">Semester Offered</th>
              <th class="text-left">Sections</th>
              <th class="text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="course in courses" :key="team.id">
              <td>{{ course.courseId }}</td>
              <td>{{ course.name }}</td>
              <td>{{ course.description }}</td>
              <td>{{ course.semesterOffered }}</td>
              <td>{{ course.sections?.length ?? 0 }}</td>
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
