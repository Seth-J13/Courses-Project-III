<script setup>
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import semesterServices from "../services/semesterServices.js";
import Utils from "../config/utils.js";
import SemesterForm from "../components/SemesterForm.vue";

const router = useRouter();

const emptyForm = () => ({
  semesterId: "",
  startDate: "",
  endDate: "",
});

const semesters = ref([]);
const loading = ref(false);
const loadingSemesters = ref(false);
const listError = ref("");
const formDialogOpen = ref(false);
const form = ref(emptyForm());
const formRef = ref(null);
const formError = ref("");
const saving = ref(false);
const deleteDialogOpen = ref(false);
const semesterToDelete = ref(null);
const deleting = ref(false);
const isAdmin = computed(() => Utils.getStore("user")?.role === "admin");

const storedId = ref("");
const mode = ref("");

const search = ref("");
const filteredSemesters = computed(() => {
  const query = search.value.trim().toLowerCase();
  if (!query) {
    return semesters.value;
  }
  return semesters.value.filter((semester) =>
    semester.semesterId.toLowerCase().includes(query)
  );
});

const retrieveSemesters = async () => {
  loading.value = true;
  listError.value = "";

  try {
    const [semestersResponse] = await Promise.all([
      semesterServices.getSemesters(),
    ]);
    semesters.value = semestersResponse.data;
  } catch (error) {
    listError.value =
      error.response?.data?.message || "Failed to fetch semesters.";
  } finally {
    loading.value = false;
  }
};

const openAddDialog = () => {
  form.value = emptyForm();
  formError.value = "";
  formDialogOpen.value = true;
  mode.value = "Create"
};


const closeFormDialog = () => {
  formDialogOpen.value = false;
  formError.value = "";
};

const saveSemester = async (mode) => {
  formError.value = "";
  const result = await formRef.value?.validate();

  if (!result?.valid) {
    return;
  }

  saving.value = true;

  try {
    if (mode.toLowerCase() === "create"){
      await semesterServices.createSemester({
        semesterId: form.value.semesterId.trim(),
        startDate: form.value.startDate.toString(),
        endDate: form.value.endDate.toString(),
      });
    }
    else if (mode.toLowerCase() === "update"){
      await semesterServices.updateSemester(storedId.value, {
        semesterId: form.value.semesterId.trim(),
        startDate: form.value.startDate.toString(),
        endDate: form.value.endDate.toString(),
      })
    }
    closeFormDialog();
    await retrieveSemesters();
  } catch (error) {
    console.log(error)
    formError.value =
      error.response?.data?.message || "Failed to create semester.";
  } finally {
    saving.value = false;
  }
};

const openSemester = (semester) => {
  mode.value = "Update"
  storedId.value = semester.semesterId;
  form.value = {
    semesterId: semester.semesterId.trim(),
    startDate: semester.startDate.trim(),
    endDate: semester.endDate.trim(),
  };
  formDialogOpen.value = true;
};

const openDeleteDialog = (semester) => {
  semesterToDelete.value = semester;
  deleteDialogOpen.value = true;
};

const closeDeleteDialog = () => {
  deleteDialogOpen.value = false;
  semesterToDelete.value = null;
};

const confirmDeleteSemester = async () => {
  if (!semesterToDelete.value?.semesterId) {
    return;
  }

  deleting.value = true;
  listError.value = "";

  try {
    await semesterServices.deleteSemester(semesterToDelete.value.semesterId);
    closeDeleteDialog();
    await retrieveSemesters();
  } catch (error) {
    listError.value =
      error.response?.data?.message || "Failed to delete semester.";
  } finally {
    deleting.value = false;
  }
};

const parseDate = (date) => new Date(date).toDateString()

onMounted(retrieveSemesters);
</script>

<template>
  <v-container class="py-8">
    <v-card rounded="lg">

      <v-card-item>
        <v-card-title>Semesters</v-card-title>
        <template #append>
          <v-btn
            v-if="isAdmin"
            color="primary"
            variant="elevated"
            class="oc-cta"
            @click="openAddDialog"
          >
            + New semester
          </v-btn>
        </template>
      </v-card-item>

      <v-card-text>
        <v-progress-linear v-if="loading" indeterminate class="mb-4" />

        <v-alert v-if="listError" type="error" density="compact" class="mb-4">
          {{ listError }}
        </v-alert>

        <v-text-field
          v-if="!loading && semesters.length > 0"
          v-model="search"
          label="Find"
          density="comfortable"
          class="mb-4"
        />

        <p v-if="!loading && semesters.length === 0" class="text-body-1">
          {{
            isAdmin
              ? "No semesters yet. Create your first semester."
              : "No semesters assigned."
          }}
        </p>

        <v-table v-if="!loading && semesters.length > 0">
          <thead>
            <tr>
              <th class="text-left">Semester Id</th>
              <th class="text-left">Starting Date</th>
              <th class="text-left">Ending Date</th>
              <th class="text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="semester in filteredSemesters" :key="semester.semesterId">
              <td>{{ semester.semesterId }}</td>
              <td>{{ parseDate(semester.startDate) }}</td>
              <td>{{ parseDate(semester.endDate) }}</td>
              <td>
                <v-icon
                  size="small"
                  class="mx-4"
                  aria-label="Open semester"
                  @click="openSemester(semester)"
                >
                  mdi-account-group
                </v-icon>
                <v-icon
                  v-if="isAdmin"
                  size="small"
                  class="mx-4"
                  aria-label="Delete semester"
                  @click="openDeleteDialog(semester)"
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
        <v-card-title>{{mode}} Semester</v-card-title>
        <v-card-text>
          <SemesterForm ref="formRef" v-model="form" @submit="saveSemester(mode)" />
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
            @click="saveSemester(mode)"
          >
            {{mode}}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

   

    <v-dialog v-model="deleteDialogOpen" max-width="420">
      <v-card rounded="lg">
        <v-card-title>Delete Semester</v-card-title>
        <v-card-text>Delete this semester?</v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="closeDeleteDialog">Cancel</v-btn>
          <v-btn
            color="primary"
            variant="elevated"
            class="oc-cta"
            :loading="deleting"
            @click="confirmDeleteSemester"
          >
            Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>
