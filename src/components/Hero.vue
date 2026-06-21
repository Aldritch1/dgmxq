<script setup>
defineProps({
  name: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  bio: {
    type: String,
    required: true
  },
  avatar: {
    type: String,
    required: true
  }
})
</script>

<template>
  <section id="home" class="hero section">
    <div class="hero__container container">
      <div class="hero__content">
        <p class="hero__greeting">Hi, I'm</p>
        <h1 class="hero__name">{{ name }}</h1>
        <p class="hero__title">{{ title }}</p>
        <p class="hero__bio">{{ bio }}</p>
        <a href="#projects" class="hero__cta btn btn-primary">View My Work</a>
      </div>
      <div class="hero__image-wrapper">
        <img :src="avatar" :alt="name" class="hero__image" />
      </div>
    </div>
  </section>
</template>

<style scoped>
.hero {
  min-height: 100vh;
  display: flex;
  align-items: center;
  padding-top: 6rem;
  background-color: var(--color-bg-alt);
}

.hero__container {
  display: grid;
  grid-template-columns: 1fr;
  gap: 3rem;
  align-items: center;
}

.hero__content {
  text-align: center;
}

.hero__greeting {
  font-size: 1.125rem;
  color: var(--color-primary);
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.hero__name {
  font-size: 2.75rem;
  font-weight: 800;
  line-height: 1.1;
  margin-bottom: 0.75rem;
}

.hero__title {
  font-size: 1.25rem;
  color: var(--color-text-muted);
  margin-bottom: 1.25rem;
}

.hero__bio {
  font-size: 1rem;
  color: var(--color-text-muted);
  max-width: 500px;
  margin: 0 auto 1.75rem;
}

.hero__cta {
  font-size: 1rem;
}

.hero__image-wrapper {
  display: flex;
  justify-content: center;
}

.hero__image {
  width: 240px;
  height: 240px;
  border-radius: 50%;
  object-fit: cover;
  background-color: #e2e8f0;
}

@media (min-width: 768px) {
  .hero__name {
    font-size: 3.5rem;
  }

  .hero__image {
    width: 300px;
    height: 300px;
  }
}

@media (min-width: 1024px) {
  .hero__container {
    grid-template-columns: 1.2fr 1fr;
  }

  .hero__content {
    text-align: left;
  }

  .hero__bio {
    margin-left: 0;
  }

  .hero__name {
    font-size: 4rem;
  }

  .hero__image {
    width: 360px;
    height: 360px;
  }
}
</style>
