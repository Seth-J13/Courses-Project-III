<script setup>
import { computed, onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import Utils from "../config/utils.js";
import facultyServices from "../services/facultyServices.js";
import FacultyForm from "../components/FacultyForm.vue";

const route = useRoute();

const emptyFacultyForm = () => ({
  facultyId: "",
  fName: "",
  lName: "",
  department: "",
});

const faculty = ref(null)
const formRef = ref(null);
const facultyToRemove = ref(null);
const editingFacultyId = ref(null);
const saving = ref(false);
const loading = ref(false);
const addModelOpen = ref(false);
const savingFaculty = ref(false);
const removingFaculty = ref(false);
const removeFacultyDialogOpen = ref(false);
const faculties = ref([]);
const listError = ref("");
const formError = ref("");
const facultyFormError = ref("");
const facultyForm = ref(emptyFacultyForm());

const retrieveFaculty = async () => {
  loading.value = true;
  listError.value = "";

  try {
    const facultyResponse = await facultyServices.getFaculty();
    faculties.value = facultyResponse.data;
  } catch (error) {
    listError.value =
      error.response?.data?.message || "Failed to fetch faculty.";
  } finally {
    loading.value = false;
  }
};

const openEditDialog = () => {
  if (!team.value) {
    return;
  }

  form.value = {
    name: team.value.name ?? "",
    leagueId: team.value.leagueId ?? null,
    homeField: team.value.homeField ?? "",
    managerId: team.value.managerId ?? null,
  };
  formError.value = "";
  formDialogOpen.value = true;
};

const closeFormDialog = () => {
  addModelOpen.value = false;
  formError.value = "";
};

const addFaculty = async () => {
  formError.value = "";
  const result = await formRef.value?.validate();

  if (!result?.valid) {
    return;
  }

  saving.value = true;

  try {
    await facultyServices.createFaculty({
      fName: facultyForm.value.fName.trim(),
      lName: facultyForm.value.lName.trim(),
      department: facultyForm.value.department.trim()
    });
    closeFormDialog();
    await retrieveFaculty();
  } catch (error) {
    formError.value =
    error.response?.data?.message || "Failed to add faculty.";
  } finally {
    saving.value = false;
  }
};

const updateFaculty = async () => {
  facultyFormError.value = "";
  const result = await playerFormRef.value?.validate();

  if (!result?.valid || !team.value) {
    return;
  }

  savingFaculty.value = true;

  const payload = {
    personId: playerForm.value.personId,
    position: String(playerForm.value.position).trim(),
    number: parseInt(playerForm.value.number, 10),
  };

  try {
    if (isAddPlayerMode.value) {
      await teamServices.createPlayer(team.value.id, payload);
    } else {
      await teamServices.updatePlayer(
        team.value.id,
        editingFacultyId.value,
        payload,
      );
    }

    closeFacultyEditDialog();
    await retrieveTeam();
  } catch (error) {
    facultyFormError.value =
      error.response?.data?.message ||
      (isAddPlayerMode.value
        ? "Failed to add player."
        : "Failed to update player.");
  } finally {
    savingFaculty.value = false;
  }
};

const openAddFacultyDialog = () => {
  addModelOpen.value = true;
  facultyForm.value = {facultyId: "", fName:"", lName:"", department:""};
  facultyFormError.value = "";
  addModelOpen.value = true;
};

const openEditPlayerDialog = (player) => {
  isAddPlayerMode.value = false;
  editingFacultyId.value = player.id;
  playerForm.value = {
    personId: player.personId ?? null,
    position: player.position ?? "",
    number: player.number,
  };
  facultyFormError.value = "";
  playerDialogOpen.value = true;
};

const closeFacultyEditDialog = () => {
  playerDialogOpen.value = false;
  facultyFormError.value = "";
  editingFacultyId.value = null;
};


const openRemoveFacultyDialog = (faculty) => {
  facultyToRemove.value = faculty;
  removeFacultyDialogOpen.value = true;
};

const closeRemoveFacultyDialog = () => {
  facultyToRemove.value = null;
  removeFacultyDialogOpen.value = false;

};

const confirmRemoveFaculty = async () => {
  if (facultyToRemove.value?.facultyId === undefined || Number.isNaN(facultyToRemove.value?.facultyId)) {
    return;
  }

  removingFaculty.value = true;

  try {
    await facultyServices.deleteFaculty(facultyToRemove.value?.facultyId);
    closeRemoveFacultyDialog();
    await retrieveFaculty();
  } catch (error) {
    facultyFormError.value =
      error.response?.data?.message || "Failed to remove faculty.";
  } finally {
    removingFaculty.value = false;
  }
};

onMounted(retrieveFaculty);
// watch(() => route.params.teamId, retrieveFaculty);
</script>

<template>
  <v-container class="py-8">
    <v-card rounded="lg">
      <v-card-item>
        <v-card-title class="text-center">{{ "Faculty" }}</v-card-title>
        <v-card-item class="text-right">
          <v-btn
          color="primary"
          variant="elevated"
          class="oc-cta mr-2"
          @click="openAddFacultyDialog">Add Faculty</v-btn>
        </v-card-item>
        <v-card-text v-if="faculties">
          <v-table>
            <thead>
              <tr>
                <th><b>Last</b></th>
                <th><b>First</b></th>
                <th><b>Department</b></th>
                <th><b>Actions</b></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="faculty in faculties" :key="faculty.facultyId">
                <td>{{ faculty.lName }}</td>
                <td>{{ faculty.fName }}</td>
                <td>{{ faculty.department }}</td>
                <td>
                  <v-icon
                    color="primary"
                    variant="elevated"
                    class="oc-cta mr-2"
                    @click="debug">
                  mdi-pencil
                  </v-icon>
                  <v-icon
                    color="primary"
                    variant="elevated"
                    class="oc-cta mr-2"
                    @click="openRemoveFacultyDialog(faculty)"
                  >
                  mdi-delete
                  </v-icon>
                </td>
              </tr>
            </tbody>
          </v-table>
        </v-card-text>
      </v-card-item>
    </v-card>

    <!-- Add New Faculty Dialog -->
    <v-dialog v-model="addModelOpen" max-width="520">
      <v-card rounded="lg">
        <v-card-title>Add Faculty</v-card-title>
        <v-card-text>

          <FacultyForm 
          ref="formRef"
          v-model="form"
          v-model:model-value="facultyForm"
          @submit="addFaculty"/>

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
            @click="addFaculty"
          >
            Add Faculty
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    
    <!-- Edit Faculty Dialog -->
    <v-dialog v-model="playerDialogOpen" max-width="520">
      <v-card rounded="lg">
        <v-card-title>{{ playerFormTitle }}</v-card-title>
        <v-card-text>
          <!-- <PlayerForm
            ref="playerFormRef"
            v-model="playerForm"
            :people="people"
            @submit="savePlayer"
          /> This was the old player form, no longer needed for courses -->
          <v-alert
            v-if="facultyFormError"
            type="error"
            density="compact"
            class="mt-2"
          >
            {{ facultyFormError }}
          </v-alert>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="closeFacultyEditDialog">Cancel</v-btn>
          <v-btn
            color="primary"
            variant="elevated"
            class="oc-cta"
            :loading="savingFaculty"
            @click="updateFaculty"
          >
            {{ playerSaveLabel }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Faculty Dialog -->
    <v-dialog v-model="removeFacultyDialogOpen" max-width="420">
      <v-card rounded="lg">
        <v-card-title>Remove Faculty</v-card-title>
        <v-card-text>Remove {{facultyToRemove?.fName}} {{facultyToRemove?.lName}}?</v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="closeRemoveFacultyDialog">Cancel</v-btn>
          <v-btn
            color="primary"
            variant="elevated"
            class="oc-cta"
            :loading="removingFaculty"
            @click="confirmRemoveFaculty"
          >
            Remove Faculty
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>
