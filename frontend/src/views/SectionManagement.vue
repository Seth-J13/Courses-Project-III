<script setup>
import { computed, onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import sectionServices from "../services/sectionServices.js";
// import { formatDate, toDateInputValue } from "../config/validation.js";

const route = useRoute();

const emptyGameForm = (sectionId) => ({
  sectionId: sectionId ?? null,
  gameDate: "",
  startTime: "",
  location: "",
  homeTeamId: null,
  visitingTeamId: null,
  homeTeamScore: "",
  visitingTeamScore: "",
});

const section = ref(null);
const games = ref([]);
const sections = ref([]);
const teams = ref([]);
const loading = ref(false);
const listError = ref("");
const formDialogOpen = ref(false);
const isAddMode = ref(true);
const form = ref(emptyGameForm());
const formRef = ref(null);
const formError = ref("");
const saving = ref(false);
const editingId = ref(null);
const creatingGames = ref(false);

const formTitle = computed(() => (isAddMode.value ? "Add Game" : "Edit Game"));
const saveLabel = computed(() => (isAddMode.value ? "Create" : "Save Game"));

const sectionId = computed(() => parseInt(route.params.sectionId, 10));

const sectionGames = computed(() =>
  games.value.filter((game) => game.sectionId === sectionId.value)
);

const toTimeInputValue = (value) => {
  if (!value) {
    return "";
  }

  const match = String(value).match(/(\d{2}:\d{2})/);
  return match ? match[1] : String(value);
};

const formatScore = (value) => {
  if (value === null || value === undefined || value === "") {
    return "";
  }

  return value;
};

const optionalScore = (value) => {
  if (value === "" || value === null || value === undefined) {
    return null;
  }

  return Number(value);
};

const retrievesection = async () => {
  loading.value = true;
  listError.value = "";

  try {
    const [sectionsResponse, gamesResponse, teamsResponse] = await Promise.all([
      sectionServices.getsections(),
      gameServices.getGames(),
      teamServices.getTeams(),
    ]);
    sections.value = sectionsResponse.data;
    games.value = gamesResponse.data;
    teams.value = teamsResponse.data;
    section.value =
      sectionsResponse.data.find((row) => row.id === sectionId.value) ?? null;

    if (!section.value) {
      listError.value = `section with id=${sectionId.value} not found.`;
    }
  } catch (error) {
    listError.value =
      error.response?.data?.message || "Failed to fetch section.";
  } finally {
    loading.value = false;
  }
};

const createsectionGames = async () => {
  if (!section.value) {
    return;
  }

  listError.value = "";
  creatingGames.value = true;

  try {
    await sectionServices.createGames(sectionId.value);
    await retrievesection();
  } catch (error) {
    listError.value =
      error.response?.data?.message || "Failed to create games.";
  } finally {
    creatingGames.value = false;
  }
};

const openAddGameDialog = () => {
  isAddMode.value = true;
  editingId.value = null;
  form.value = emptyGameForm(sectionId.value);
  formError.value = "";
  formDialogOpen.value = true;
};

const openEditGameDialog = (game) => {
  isAddMode.value = false;
  editingId.value = game.id;
  form.value = {
    sectionId: game.sectionId ?? sectionId.value,
    gameDate: toDateInputValue(game.gameDate),
    startTime: toTimeInputValue(game.startTime),
    location: game.location ?? "",
    homeTeamId: game.homeTeamId ?? null,
    visitingTeamId: game.visitingTeamId ?? null,
    homeTeamScore: game.homeTeamScore ?? "",
    visitingTeamScore: game.visitingTeamScore ?? "",
  };
  formError.value = "";
  formDialogOpen.value = true;
};

const closeFormDialog = () => {
  formDialogOpen.value = false;
  formError.value = "";
  editingId.value = null;
};

const saveGame = async () => {
  formError.value = "";
  const result = await formRef.value?.validate();

  if (!result?.valid) {
    return;
  }

  saving.value = true;

  const payload = {
    sectionId: form.value.sectionId,
    gameDate: form.value.gameDate,
    startTime: form.value.startTime,
    location: isAddMode.value ? null : form.value.location.trim() || null,
    homeTeamId: form.value.homeTeamId,
    visitingTeamId: form.value.visitingTeamId,
    homeTeamScore: optionalScore(form.value.homeTeamScore),
    visitingTeamScore: optionalScore(form.value.visitingTeamScore),
  };

  try {
    if (isAddMode.value) {
      await gameServices.createGame(payload);
    } else {
      await gameServices.updateGame(editingId.value, {
        ...payload,
        gameId: editingId.value,
      });
    }
    closeFormDialog();
    await retrievesection();
  } catch (error) {
    formError.value =
      error.response?.data?.message ||
      (isAddMode.value ? "Failed to create game." : "Failed to update game.");
  } finally {
    saving.value = false;
  }
};

onMounted(retrievesection);
watch(() => route.params.sectionId, retrievesection);
</script>

<template>
  <v-container class="py-8">
    <v-card rounded="lg">
      <v-card-item>
        <v-card-title>{{ section?.name || "section" }}</v-card-title>
        <v-card-subtitle v-if="section">
          {{ section.league?.name }}
          <template v-if="section.startDate || section.endDate">
            · {{ formatDate(section.startDate) }} – {{ formatDate(section.endDate) }}
          </template>
        </v-card-subtitle>
        <template #append>
          <v-btn
            color="primary"
            variant="elevated"
            class="oc-cta mr-2"
            :disabled="!section"
            :loading="creatingGames"
            @click="createsectionGames"
          >
            Create Games
          </v-btn>
          <v-btn
            color="primary"
            variant="elevated"
            class="oc-cta"
            :disabled="!section"
            @click="openAddGameDialog"
          >
            Add Games
          </v-btn>
        </template>
      </v-card-item>

      <v-card-text>
        <v-progress-linear v-if="loading" indeterminate class="mb-4" />

        <v-alert v-if="listError" type="error" density="compact" class="mb-4">
          {{ listError }}
        </v-alert>

        <template v-if="!loading && section">
          <p v-if="sectionGames.length === 0" class="text-body-1">
            No games yet. Add the first game.
          </p>

          <v-table v-if="sectionGames.length > 0">
            <thead>
              <tr>
                <th class="text-left">Date</th>
                <th class="text-left">Start time</th>
                <th class="text-left">Location</th>
                <th class="text-left">Home team</th>
                <th class="text-left">Visiting team</th>
                <th class="text-left">Home score</th>
                <th class="text-left">Visiting score</th>
                <th class="text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="game in sectionGames" :key="game.id">
                <td>{{ formatDate(game.gameDate) }}</td>
                <td>{{ toTimeInputValue(game.startTime) }}</td>
                <td>{{ game.location }}</td>
                <td>{{ game.homeTeam?.name }}</td>
                <td>{{ game.visitingTeam?.name }}</td>
                <td>{{ formatScore(game.homeTeamScore) }}</td>
                <td>{{ formatScore(game.visitingTeamScore) }}</td>
                <td>
                  <v-icon
                    size="small"
                    class="mx-4"
                    aria-label="Edit game"
                    @click="openEditGameDialog(game)"
                  >
                    mdi-pencil
                  </v-icon>
                </td>
              </tr>
            </tbody>
          </v-table>
        </template>
      </v-card-text>
    </v-card>

    <v-dialog v-model="formDialogOpen" max-width="560">
      <v-card rounded="lg">
        <v-card-title>{{ formTitle }}</v-card-title>
        <v-card-text>
          <GameForm
            ref="formRef"
            v-model="form"
            :sections="sections"
            :teams="teams"
            :show-location="!isAddMode"
            @submit="saveGame"
          />
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
            @click="saveGame"
          >
            {{ saveLabel }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>
