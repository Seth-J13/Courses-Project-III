<script setup>
import { computed, ref } from "vue";

const props = defineProps({
  modelValue: { type: Object, required: true },
});

const emit = defineEmits(["update:modelValue", "submit"]);

const formRef = ref(null);

const updateField = (field, value) => {
  emit("update:modelValue", { ...props.modelValue, [field]: value });
};

const idRules = [
  (value) => !!value?.trim() || "Required",
  (value) => (value?.trim() || "").length <= 6 || "ID must be 6 characters or fewer.",
];
const validate = () => formRef.value.validate();

defineExpose({ validate });
</script>

<template>
  <v-form ref="formRef" @submit.prevent="emit('submit')">
    <v-text-field
      :model-value="modelValue.semesterId"
      label="Semester ID"
      density="comfortable"
      :rules="idRules"
      @update:model-value="updateField('semesterId', $event)"
    />
    <v-date-picker
      :model-value="modelValue.startDate"
      label="startDate"
      density="comfortable"
      @update:model-value="updateField('startDate', $event)"
    >Starting Date</v-date-picker>
    <v-date-picker
      :model-value="modelValue.endDate"
      label="endDate"
      density="comfortable"
      @update:model-value="updateField('endDate', $event)"
    >Ending Date</v-date-picker>
  </v-form>
</template>
