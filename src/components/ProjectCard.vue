<script setup>
defineProps({
  project: {
    type: Object,
    required: true
  }
})
</script>

<template>
  <article class="project-card">
    <img :src="project.image" :alt="project.title" class="project-card__image" />
    <div class="project-card__body">
      <h3 class="project-card__title">{{ project.title }}</h3>
      <p class="project-card__description">{{ project.description }}</p>
      <div class="project-card__tags">
        <span v-for="tag in project.tags" :key="tag" class="project-card__tag">
          {{ tag }}
        </span>
      </div>
      <a :href="project.link" target="_blank" rel="noopener noreferrer" class="project-card__link">
        View Project →
      </a>
    </div>
  </article>
</template>

<style scoped>
.project-card {
  background-color: var(--color-bg);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: 0 4px 12px var(--color-card-shadow);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.project-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px var(--color-card-shadow-hover);
}

.project-card__image {
  width: 100%;
  height: 180px;
  object-fit: cover;
  background-color: #e2e8f0;
}

.project-card__body {
  padding: 1.5rem;
}

.project-card__title {
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.project-card__description {
  color: var(--color-text-muted);
  font-size: 0.95rem;
  margin-bottom: 1rem;
}

.project-card__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.project-card__tag {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  background-color: rgba(59, 130, 246, 0.1);
  color: var(--color-primary);
}

.project-card__link {
  font-weight: 600;
  color: var(--color-primary);
  transition: color 0.2s ease;
}

.project-card__link:hover {
  color: var(--color-primary-hover);
}
</style>
