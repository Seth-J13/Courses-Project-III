<script setup>
import { ref } from "vue";

const props = defineProps({
  modelValue: { type: Object, required: true },
});

const emit = defineEmits(["update:modelValue", "submit"]);

const formRef = ref(null);

const updateField = (field, value) => {
  emit("update:modelValue", { ...props.modelValue, [field]: value });
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
    <v-text-field
      :model-value="modelValue.name"
      label="League Name"
      density="comfortable"
      :rules="nameRules"
      @update:model-value="updateField('name', $event)"
    />
    <v-select
      :model-value="modelValue.sport"
      label="Sport"
      :items="sportOptions"
      density="comfortable"
      :rules="sportRules"
      @update:model-value="updateField('sport', $event)"
    />
  </v-form>
</template>
