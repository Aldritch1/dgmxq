<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

defineProps({
  name: {
    type: String,
    required: true
  }
})

const isScrolled = ref(false)
const isMobileMenuOpen = ref(false)

function handleScroll() {
  isScrolled.value = window.scrollY > 10
}

function toggleMobileMenu() {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

function closeMobileMenu() {
  isMobileMenuOpen.value = false
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<template>
  <header
    class="navbar"
    :class="{ 'navbar--scrolled': isScrolled }"
  >
    <div class="navbar__container container">
      <a href="#home" class="navbar__logo" @click="closeMobileMenu">
        {{ name }}
      </a>

      <button
        class="navbar__toggle"
        aria-label="Toggle menu"
        aria-expanded="isMobileMenuOpen"
        @click="toggleMobileMenu"
      >
        <span class="navbar__toggle-bar" :class="{ 'open': isMobileMenuOpen }"></span>
        <span class="navbar__toggle-bar" :class="{ 'open': isMobileMenuOpen }"></span>
        <span class="navbar__toggle-bar" :class="{ 'open': isMobileMenuOpen }"></span>
      </button>

      <nav class="navbar__nav" :class="{ 'navbar__nav--open': isMobileMenuOpen }">
        <a href="#home" class="navbar__link" @click="closeMobileMenu">Home</a>
        <a href="#projects" class="navbar__link" @click="closeMobileMenu">Projects</a>
        <a href="#contact" class="navbar__link" @click="closeMobileMenu">Contact</a>
      </nav>
    </div>
  </header>
</template>

<style scoped>
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background-color: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(8px);
  transition: box-shadow 0.2s ease;
}

.navbar--scrolled {
  box-shadow: 0 1px 3px var(--color-border);
}

.navbar__container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 4rem;
}

.navbar__logo {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-text);
}

.navbar__toggle {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 0.35rem;
  width: 2rem;
  height: 2rem;
  background: transparent;
  border: none;
  cursor: pointer;
}

.navbar__toggle-bar {
  display: block;
  width: 100%;
  height: 2px;
  background-color: var(--color-text);
  transition: transform 0.2s ease, opacity 0.2s ease;
}

.navbar__toggle-bar.open:nth-child(1) {
  transform: translateY(7px) rotate(45deg);
}

.navbar__toggle-bar.open:nth-child(2) {
  opacity: 0;
}

.navbar__toggle-bar.open:nth-child(3) {
  transform: translateY(-7px) rotate(-45deg);
}

.navbar__nav {
  position: absolute;
  top: 4rem;
  left: 0;
  right: 0;
  display: flex;
  flex-direction: column;
  gap: 0;
  background-color: var(--color-bg);
  border-bottom: 1px solid var(--color-border);
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease;
}

.navbar__nav--open {
  max-height: 200px;
}

.navbar__link {
  padding: 1rem 1.5rem;
  font-weight: 500;
  color: var(--color-text-muted);
  transition: color 0.2s ease;
}

.navbar__link:hover {
  color: var(--color-primary);
}

@media (min-width: 768px) {
  .navbar__toggle {
    display: none;
  }

  .navbar__nav {
    position: static;
    flex-direction: row;
    gap: 2rem;
    background-color: transparent;
    border-bottom: none;
    max-height: none;
    overflow: visible;
  }

  .navbar__link {
    padding: 0;
  }
}
</style>
