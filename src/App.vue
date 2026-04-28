<script setup>
import TheHeader from '@/components/TheHeader.vue'
</script>

<template>
    <div class="min-h-screen">
        <TheHeader class="no-print" />
        <main class="mt-16">
            <router-view />
        </main>
    </div>
</template>
