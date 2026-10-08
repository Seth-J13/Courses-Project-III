<script setup>
import { ref } from "vue";

const props = defineProps({
  modelValue: { type: Object, required: true},
  courses: { type: Array, required: true },
  courseDetails: { type: String, default: () => ""},
  sections: { type: Array, default: () => []},
  sectionDetails: { type: String, default: () => ""},
  show_course: Boolean,
  show_section_box: Boolean,
  show_section: Boolean
});
const emit = defineEmits(["update:modelValue", "submit"]);

const formRef = ref(null);

const updateField = (field, value) => {
  emit("update:modelValue", { ...props.modelValue, [field]: value, ...((field === "course") ? { section: "" } : {})});
};

const courseRules = [
  (value) => !!value?.trim() || "Required"
];
const sectionRules = [
  (value) => !!value || "Required"
];

const validate = () => formRef.value.validate();

defineExpose({ validate });
</script>

<template>
  <v-form ref="formRef" @submit.prevent="emit('submit')">
    <v-combobox
      :model-value="modelValue.course"
      label="Course"
      density="comfortable"
      :rules="courseRules"
      :items="courses"
      @update:model-value="updateField('course', $event)"
    />
    <v-card-text v-if="props.show_course" density="compact">
      {{ courseDetails }}
    </v-card-text>
    <v-select v-if="props.show_section_box"
      :model-value="modelValue.section"
      label="Section"
      density="comfortable"
      :rules="sectionRules"
      :items="sections"
      @update:model-value="updateField('section', $event)"
    />
    <v-card-text v-if="props.show_section" density="comfortable">
      <pre>{{ sectionDetails }}</pre>
    </v-card-text>
  </v-form>
</template>
