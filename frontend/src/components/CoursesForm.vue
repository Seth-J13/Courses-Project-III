<script setup>
import { computed, ref } from "vue";

const props = defineProps({
  modelValue: { type: Object, required: true },
});

const emit = defineEmits(["update:modelValue", "submit"]);

const formRef = ref(null);

const semesterOfferedOptions = [
  "SP",
  "SU",
  "FA",
  "WI",
];

const offeringFrequencyOptions = [
  "none", 
  "everyYear", 
  "oddYears", 
  "evenYears"
];

const descriptionRules = [
  (value) => !!value?.trim() || "Required",
  (value) => (value?.trim() || "").length <= 255 || "Description must be 255 characters or fewer.",
];

const updateField = (field, value) => {
  emit("update:modelValue", { ...props.modelValue, [field]: value });
};

const requiredRule = [(value) => !!value?.toString().trim() || "Required"];
const idRules = [
  (value) => !!value?.trim() || "Required",
  (value) => (value?.trim() || "").length <= 9 || "ID must be 9 characters or fewer.",
];
const nameRules = [
  (value) => !!value?.trim() || "Required",
  (value) =>
    (value?.trim() || "").length <= 50 ||
    "Course name must be 50 characters or fewer.",
];

const semesterOfferedRules = [
  (value) => !!value?.trim() || "Required",
  (value) => (value?.trim() || "").length <= 2 || "Semester offered must be 2 characters or fewer.",
];

const offeringFrequencyRules = [
  (value) => !!value?.trim() || "Required",
  (value) => (value?.trim() || "").length <= 20 || "Offering frequency must be 20 characters or fewer.",
];
const validate = () => formRef.value.validate();

defineExpose({ validate });
</script>

<template>
  <v-form ref="formRef" @submit.prevent="emit('submit')">
    <v-text-field
      :model-value="modelValue.courseId"
      label="Course ID"
      density="comfortable"
      :rules="idRules"
      @update:model-value="updateField('courseId', $event)"
    />
    <v-text-field
      :model-value="modelValue.courseName"
      label="Course Name"
      density="comfortable"
      :rules="nameRules"
      @update:model-value="updateField('courseName', $event)"
    />
    <v-select
      :model-value="modelValue.semesterOffered"
      label="Semester Offered"
      :items="semesterOfferedOptions"
      density="comfortable"
      :rules="semesterOfferedRules"
      @update:model-value="updateField('semesterOffered', $event)"
    />
    <v-select
      :model-value="modelValue.offeringFrequency"
      label="Offering Frequency"
      :items="offeringFrequencyOptions"
      density="comfortable"
      :rules="offeringFrequencyRules"
      @update:model-value="updateField('offeringFrequency', $event)"
    />
    <v-text-field
      :model-value="modelValue.description"
      label="Description"
      density="comfortable"
      :rules="descriptionRules"
      @update:model-value="updateField('description', $event)"
    />
  </v-form>
</template>
