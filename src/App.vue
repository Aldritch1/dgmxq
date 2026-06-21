<script setup>
import Navbar from './components/Navbar.vue'
import Hero from './components/Hero.vue'
import ProjectGrid from './components/ProjectGrid.vue'
import Footer from './components/Footer.vue'
import { profile, projects } from './data/profile.js'
</script>

<template>
  <Navbar :name="profile.name" />
  <Hero
    :name="profile.name"
    :title="profile.title"
    :bio="profile.bio"
    :avatar="profile.avatar"
  />
  <ProjectGrid :projects="projects" />
  <Footer :social="profile.social" />
</template>

<style scoped>
</style>
