<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import authServices from "../services/authServices.js";
import Utils from "../config/utils.js";

const router = useRouter();
const form = ref(null);
const email = ref("");
const password = ref("");
const loading = ref(false);
const errorMessage = ref("");
const snackbar = ref(false);

const emailRules = [(value) => !!value?.trim() || "Email is required."];
const passwordRules = [(value) => !!value || "Password is required."];

const handleSubmit = async () => {
  errorMessage.value = "";
  const { valid } = await form.value.validate();

  if (!valid) {
    return;
  }

  loading.value = true;

  try {
    const response = await authServices.loginUser({
      email: email.value.trim(),
      password: password.value,
    });

    Utils.setStore("user", response.data);
    window.dispatchEvent(new CustomEvent("user-logged-in"));
    snackbar.value = true;

    if (response.data.role === "admin") {
      await router.push({ name: "Semester" });
    } else if (response.data.role === "student") {
      await router.push({ name: "EnrollmentList" });
    }
  } catch (error) {
    errorMessage.value = error.response?.data?.message || "Login failed.";
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <v-container class="fill-height">
    <v-row align="center" justify="center" class="fill-height">
      <v-col cols="12" sm="8" md="5" lg="4">
        <v-card elevation="2">
          <v-card-title class="text-h5">Login</v-card-title>

          <v-card-text>
            <v-form ref="form" @submit.prevent="handleSubmit">
              <v-text-field
                v-model="email"
                label="Email"
                density="comfortable"
                autocomplete="email"
                :rules="emailRules"
                class="mb-2"
              />

              <v-text-field
                v-model="password"
                label="Password"
                type="password"
                density="comfortable"
                autocomplete="current-password"
                :rules="passwordRules"
                class="mb-2"
              />

              <v-alert
                v-if="errorMessage"
                type="error"
                density="compact"
                class="mb-4"
              >
                {{ errorMessage }}
              </v-alert>

              <v-btn
                type="submit"
                color="primary"
                variant="elevated"
                block
                :loading="loading"
              >
                Login
              </v-btn>
            </v-form>
          </v-card-text>

          <v-card-actions>
            <v-btn variant="text" :to="{ name: 'Register' }">
              Create an account
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <v-snackbar v-model="snackbar" timeout="3000">
      Login successful!
    </v-snackbar>
  </v-container>
</template>