<script setup>
import { computed, onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import Utils from "../config/utils.js";
import facultyServices from "../services/facultyServices.js";

const route = useRoute();

const emptyFacultyForm = () => ({
  facultyId: null,
  fname: "",
  lname: "",
  department: "",
});

const faculties = ref([]);
const loading = ref(false);
const listError = ref("");
const formRef = ref(null);
const formError = ref("");
const saving = ref(false);
const facultyDialogOpen = ref(false);
const isAddFacultyMode = ref(true);
const facultyForm = ref(emptyFacultyForm());
const facultyFormError = ref("");
const savingFaculty = ref(false);
const editingFacultyId = ref(null);
const removeFacultyDialogOpen = ref(false);
const facultyToRemove = ref(null);
const removingFaculty = ref(false);


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
  formDialogOpen.value = false;
  formError.value = "";
};

const saveTeam = async () => {
  formError.value = "";
  const result = await formRef.value?.validate();

  if (!result?.valid || !team.value) {
    return;
  }

  saving.value = true;

  try {
    await teamServices.updateTeam(team.value.id, {
      name: form.value.name.trim(),
      leagueId: form.value.leagueId,
      homeField: form.value.homeField.trim(),
      managerId: form.value.managerId || null,
      teamId: team.value.id,
    });
    closeFormDialog();
    await retrieveTeam();
  } catch (error) {
    formError.value =
      error.response?.data?.message || "Failed to update team.";
  } finally {
    saving.value = false;
  }
};

const openAddPlayerDialog = () => {
  isAddPlayerMode.value = true;
  editingFacultyId.value = null;
  playerForm.value = emptyPlayerForm();
  facultyFormError.value = "";
  playerDialogOpen.value = true;
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

const closePlayerDialog = () => {
  playerDialogOpen.value = false;
  facultyFormError.value = "";
  editingFacultyId.value = null;
};

const savePlayer = async () => {
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

    closePlayerDialog();
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

const openRemovePlayerDialog = (player) => {
  facultyToRemove.value = player;
  removeFacultyDialogOpen.value = true;
};

const closeRemovePlayerDialog = () => {
  removeFacultyDialogOpen.value = false;
  facultyToRemove.value = null;
};

const confirmRemovePlayer = async () => {
  if (!facultyToRemove.value?.id || !team.value) {
    return;
  }

  removingPlayer.value = true;

  try {
    await teamServices.deletePlayer(team.value.id, facultyToRemove.value.id);
    closeRemovePlayerDialog();
    await retrieveTeam();
  } catch (error) {
    facultyFormError.value =
      error.response?.data?.message || "Failed to remove player.";
  } finally {
    removingPlayer.value = false;
  }
};

onMounted(retrieveFaculty);
watch(() => route.params.teamId, retrieveFaculty);
</script>

<template>
  <v-container class="py-8">
    <v-card rounded="lg">
      <v-card-item>
        <v-card-title>{{ "Faculty" }}</v-card-title>
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
                    class="oc-cta mr-2">
                  mdi-pencil
                  </v-icon>
                  <v-icon
                    color="primary"
                    variant="elevated"
                    class="oc-cta mr-2"
                  >
                  mdi-delete
                  </v-icon>
                </td>
              </tr>
            </tbody>
          </v-table>
        </v-card-text>
      </v-card-item>

      <v-card-text>
        <v-progress-linear v-if="loading" indeterminate class="mb-4" />

        <v-alert v-if="listError" type="error" density="compact" class="mb-4">
          {{ listError }}
        </v-alert>

        <template v-if="!loading && team">
          <p v-if="rosterPlayers.length === 0" class="text-body-1">
            No players yet. Add the first player.
          </p>

          <v-table v-if="rosterPlayers.length > 0">
            <thead>
              <tr>
                <th class="text-left">Name</th>
                <th class="text-left">Number</th>
                <th class="text-left">Position</th>
                <th class="text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="player in rosterPlayers" :key="player.id">
                <td>{{ playerName(player) }}</td>
                <td>{{ player.number }}</td>
                <td>{{ player.position }}</td>
                <td>
                  <v-icon
                    v-if="canManagePlayers"
                    size="small"
                    class="mx-4"
                    aria-label="Edit player"
                    @click="openEditPlayerDialog(player)"
                  >
                    mdi-pencil
                  </v-icon>
                  <v-icon
                    v-if="canManagePlayers"
                    size="small"
                    class="mx-4"
                    aria-label="Remove player"
                    @click="openRemovePlayerDialog(player)"
                  >
                    mdi-trash-can
                  </v-icon>
                </td>
              </tr>
            </tbody>
          </v-table>
        </template>
      </v-card-text>
    </v-card>

    <v-dialog v-model="formDialogOpen" max-width="520">
      <v-card rounded="lg">
        <v-card-title>Edit Team</v-card-title>
        <v-card-text>
          <!-- <TeamForm
            ref="formRef"
            v-model="form"
            :leagues="leagues"
            :people="people"
            @submit="saveTeam"
          /> This was the old team form, no longer needed for coureses -->
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
            @click="saveTeam"
          >
            Save Team
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

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
          <v-btn variant="text" @click="closePlayerDialog">Cancel</v-btn>
          <v-btn
            color="primary"
            variant="elevated"
            class="oc-cta"
            :loading="savingFaculty"
            @click="savePlayer"
          >
            {{ playerSaveLabel }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="removeFacultyDialogOpen" max-width="420">
      <v-card rounded="lg">
        <v-card-title>Remove Player</v-card-title>
        <v-card-text>Remove this player from the team?</v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="closeRemovePlayerDialog">Cancel</v-btn>
          <v-btn
            color="primary"
            variant="elevated"
            class="oc-cta"
            :loading="removingPlayer"
            @click="confirmRemovePlayer"
          >
            Remove Player
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>
