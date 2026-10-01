<script setup>
import { useRouter } from "vue-router";
const router = useRouter();

const help = () => {
  console.log("Trying to go to login");
}
</script>

<template>
  <v-container class="py-10">
    <h1 class="text-h4 mb-2">Speckit App</h1>
    <p class="text-body-1">
      Starter shell — add <code>features/feature-1-….md</code>, then implement with Cursor.
    </p>
  </v-container>
</template>
