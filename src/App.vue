<script setup>
import TheHeader from '@/components/TheHeader.vue'
</script>

<template>
    <div class="min-h-screen">
        <TheHeader />
        <main class="pt-16">
            <router-view />
        </main>
    </div>
</template>
