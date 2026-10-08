<script setup>
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import enrollmentServices from "../services/enrollmentServices.js";
import EnrollmentForm from "../components/EnrollmentForm.vue";
import semesterServices from "../services/semesterServices_temp.js";
import courseServices from "../services/courseServices_temp.js";
import sectionServices from "../services/sectionServices_temp.js";
import facultyServices from "../services/facultyServices_temp.js";
import Utils from "../config/utils.js";

const router = useRouter();

const emptyForm = () => ({
  course: "",
  section: ""
});

const enrollments = ref([]);
const cardTitleSemester = ref("");
const loading = ref(false);
const semesterIds = ref([]);
const listError = ref("");
const selectedSemester = ref("");
const formDialogOpen = ref(false);
const form = ref(emptyForm());
const formError = ref("");

const courses = ref([])
const selectedCourse = ref("")
const showCourseDetails = ref(false)
const courseDetails = ref("")

const sections = ref([])
const showSectionBox = ref(false)
const showSectionDetails = ref(false)
const sectionDetails = ref("")

const saving = ref(false);
const deleteDialogOpen = ref(false);
const enrollmentToDelete = ref(null);
const deleting = ref(false);

const seasonList = ['SP', 'SU', 'FA', 'WI']

const loadAllSemesterIds = async () => {
  let semesters = []
  
  await semesterServices.getSemesters()
  .then((response) => {
    response.data.forEach(element => {
      semesters.push(element.semesterId)
    });
  }).catch((error) => {
    console.log(error.response?.data?.message || error.message)
  })

  semesterIds.value = semesters
}

const calcCurrentSemester = () => {
  let season = ''
  season = seasonList[Math.floor(new Date().getMonth()/4)]

  return season + `${new Date().getFullYear()}`
}

const formatTime = (time) => {
  let hour = time.substring(0,2)
  let minute = time.substring(3,5)
  let suffix = `AM`
  
  if (parseInt(hour) >= 12)
    suffix = `PM`
  if (parseInt(hour) > 12)
    hour = hour - 12

return hour + `:` + minute + suffix
}

const getSearchParams = () => new URLSearchParams(window.location.search)

const retrieveEnrollments = async () => {
  loading.value = true;
  listError.value = "";

  try {
    // get the semester argument from the search bar if it exists,
    // otherwise get the most recently-visited one if it exists,
    // otherwise calculate it based on the current date
    let sem = getSearchParams().get('semester')
    let semester = sem || Utils.getStore('lastSemChecked') || calcCurrentSemester()
    
    // if there weren't any parameters, update the search bar to include parameters
    if (!sem) {
      window.history.replaceState({}, '', window.location.href + `?semester=${semester}`)
    }

    let enrollmentResponse = {}
    if (semester !== 'null') {
      enrollmentResponse = await enrollmentServices.getEnrollmentsBySemester(Utils.getStore('user').id, semester)
      cardTitleSemester.value = semester
    }
    else {
      enrollmentResponse = await enrollmentServices.getEnrollments(Utils.getStore('user').id)
      cardTitleSemester.value = "all"
      semester = calcCurrentSemester()
    }
    enrollments.value = enrollmentResponse.data;

    // update storage and title values
    Utils.setStore('lastSemChecked', semester)
  } catch (error) {
    listError.value =
      error.response?.data?.message || "Failed to fetch enrollments.";
  } finally {
    loading.value = false;
  }
};

const openAddDialog = async () => {
  
  form.value = emptyForm();
  formError.value = "";
  formDialogOpen.value = true;

  courses.value = (await courseServices.getCourses()).data;
  
  if (cardTitleSemester === 'all')
    courses.value = courses.value.filter((course) => course.semesterOffered.includes(cardTitleSemester.value.substring(0,2)))
  courses.value = courses.value.map((course) => course.courseName.substring(0,50) + ((course.courseName.length > 50) ? `...` : '') + ` (${course.courseId})`)
};

const loadSections = async () => {
  try {
    selectedCourse.value = form.value.course
    let code = selectedCourse.value.substring( selectedCourse.value.indexOf("(") + 1, selectedCourse.value.search(/[0-9]/) + 4 )
    let course = (code) ? (await courseServices.getCourse(code)).data : null;

    sections.value = (await sectionServices.getSections(code)).data;
    sections.value = sections.value.map((section) => section.sectionId + `: ` + formatTime(section.timeStart) + '-' + formatTime(section.timeEnd))
    showSectionBox.value = Boolean(course);
    
    courseDetails.value = `Description: ${course.description}`
    showCourseDetails.value = true;

    let section = (code) ? (await sectionServices.getSectionDetails(form.value.section.substring(0,12))).data : null;
    sectionDetails.value = `Meeting Times: ${section.dayOfWeek} ${formatTime(section.timeStart)} - ${formatTime(section.timeEnd)}
Room: ${section.roomNum} 
Instructor: ${section.facultyId}`
    showSectionDetails.value = true
  } catch (err) {

  }
}

const closeFormDialog = () => {
  formDialogOpen.value = false;
  formError.value = "";
};

const enroll = async () => {
  saving.value = true;
  formError.value = "";
  try {
    await enrollmentServices.createEnrollment({
      universityId: Utils.getStore("user").id,
      semesterId: selectedSemester.value || getSearchParams().get('semester'),
      sectionId: form.value.section.substring(0,12),
    });
    closeFormDialog();
    await retrieveEnrollments();
  } catch (e) {
    formError.value = e.response?.data?.message || "Failed to enroll.";
  } finally {
    saving.value = false;
  }
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
  if (!enrollmentToDelete.value) {
    return;
  }

  deleting.value = true;
  listError.value = "";
  
  try {
    await enrollmentServices.deleteEnrollment(enrollmentToDelete.value.universityId, enrollmentToDelete.value.semesterId, enrollmentToDelete.value.sectionId);
    closeDeleteDialog();
    await retrieveEnrollments();
  } catch (error) {
    listError.value =
      error.response?.data?.message || "Failed to delete enrollment.";
  } finally {
    deleting.value = false;
  }
  closeDeleteDialog()
};

const nav = async (mode) => {
  try {
    // get the semester argument from the search bar if it exists, otherwise get the most recently-visited one
    let semester = getSearchParams().get('semester')
    let season = ''
    let year = ''

    if (semester === 'null') {
      season = Utils.getStore('lastSemChecked').substr(0,2)
      year = Utils.getStore('lastSemChecked').substr(2,6)
    }
    else {
      season = semester.substring(0,2)
      year = semester.substring(2,6)
    }
    
    let index = seasonList.indexOf(season)
    if (mode === 'next') {
      year = (index === 3) ? (parseInt(year)+1).toString() : year
      season = (index === 3) ? seasonList[0] : seasonList[index+1]
    }
    else if (mode === 'clear') {
      window.history.replaceState({}, '', window.location.origin + window.location.pathname + `?semester=null`)
      year = 'null'
      season = ''
      selectedSemester.value = ''
    }
    else if (mode === 'prev') {
      year = (index === 0) ? (parseInt(year)-1).toString() : year
      season = (index === 0) ? seasonList[3] : seasonList[index-1]
    }

    semester = (mode === 'jump') ? selectedSemester.value : season + year

    //console.log(semesterServices.getSemesters()
    if (mode !== 'clear') window.history.replaceState({}, '', window.location.origin + window.location.pathname + `?semester=${semester}`)

    retrieveEnrollments()
  } catch (error) {
    listError.value =
      error.response?.data?.message || "Failed to navigate semesters.";
  } finally {
    loading.value = false;
  }
}

const onFormUpdate = async (next) => {
  form.value = next;
  await loadSections();
};

onMounted(retrieveEnrollments);
onMounted(loadAllSemesterIds);
</script>

<template>
  <v-container class="py-8">
    <v-card rounded="lg">
      <v-card-item>
        <v-card-title>Enrollments - {{ cardTitleSemester }}</v-card-title>
          <v-combobox
            v-model="selectedSemester"
            label="Find Semester"
            class="oc-cta"
            placeholder="e.g. FA2026"
            persistent-placeholder:true
            style="max-width: 250px; margin-top: 5px"
            @update:model-value="nav('jump')"
            :items=semesterIds
          ></v-combobox>
          <div class="d-flex justify-space-between align-center mt-2" style="width: 40px; margin: -10px 0 0 0; padding: 0 0 3px 3px">
            <v-btn 
              variant="elevated"
              class="oc-cta"
              @click="nav('prev')"
              style="margin: 0 25px 0 0"
            >
              Prev
            </v-btn>

            <v-btn 
              variant="elevated"
              class="oc-cta"
              @click="nav('clear')"
              style="margin: 0 25px 0 0"
            >
              Clear
            </v-btn>
            
            <v-btn 
              variant="elevated"
              class="oc-cta"
              @click="nav('next')"
            >
              Next
            </v-btn>
        </div>

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
              <td>{{ enrollment.section.course.courseName }}</td>
              <td>{{ enrollment.section.dayOfWeek }}</td>
              <td>{{ formatTime(enrollment.section.timeStart) }} - {{ formatTime(enrollment.section.timeEnd) }}</td>
              <td>{{ enrollment.section.roomNum }}</td>
              <td>{{ enrollment.section.facultyId }}</td>
              <td>
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
        <v-card-title>Add Enrollment</v-card-title>
        <v-card-text>
          <EnrollmentForm
          ref="formRef"
          label="addEnrollment"
          :model-value="form"
          :courses="courses"
          :course-details="courseDetails"
          :sections="sections"
          :section-details="sectionDetails"
          :show_course="showCourseDetails"
          :show_section_box="showSectionBox"
          :show_section="showSectionDetails"
          @update:model-value="onFormUpdate"
          @submit=""
          />
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
            @click="enroll"
          >
            Enroll
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="deleteDialogOpen" max-width="420">
      <v-card rounded="lg">
        <v-card-title>Drop this class?</v-card-title>
        <v-card-text>Hitting 'Drop' will remove you from this section</v-card-text>
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
            Drop
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>
