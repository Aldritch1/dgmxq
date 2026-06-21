<script setup>
import ProjectCard from './ProjectCard.vue'

defineProps({
  projects: {
    type: Array,
    required: true
  }
})
</script>

<template>
  <section id="projects" class="project-grid section">
    <div class="container">
      <h2 class="section-title">Selected Works</h2>
      <div class="project-grid__list">
        <ProjectCard
          v-for="project in projects"
          :key="project.id"
          :project="project"
        />
      </div>
    </div>
  </section>
</template>

<style scoped>
.project-grid {
  background-color: var(--color-bg);
}

.project-grid__list {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}

@media (min-width: 768px) {
  .project-grid__list {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .project-grid__list {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>
