<script setup>
import { computed, ref } from "vue";

const props = defineProps({
  modelValue: { type: Object, required: true }
});

const emit = defineEmits(["update:modelValue", "submit"]);

const formRef = ref(null);

const updateField = (field, value) => {
  emit("update:modelValue", { ...props.modelValue, [field]: value });
};

const textRules = [
  (value) => (value?.trim().length ?? 0) <= 225, (value) => value !== ""
];

const validate = () => formRef.value.validate();

defineExpose({ validate });
</script>

<template>
  <v-form ref="formRef" @submit.prevent="emit('submit')">
    
    <v-text-field
      :model-value="modelValue.fName"
      label="First Name"
      type="text"
      density="comfortable"
      :rules="textRules"
      @update:model-value="updateField('fName', $event)"
    />
    <v-text-field
      :model-value="modelValue.lName"
      label="Last Name"
      density="comfortable"
      :rules="textRules"
      @update:model-value="updateField('lName', $event)"
    />
    <v-text-field
      :model-value="modelValue.department"
      label="Department"
      density="comfortable"
      :rules="textRules"
      @update:model-value="updateField('department', $event)"
    />
  </v-form>
</template>
