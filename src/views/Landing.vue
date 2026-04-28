<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useAuthStore } from '@/store/auth'
import { useI18n } from 'vue-i18n'

const auth = useAuthStore()
const { t, locale } = useI18n()

const landingRef = ref(null)
let revealObserver = null
let typewriterTimer = null
let caseStageTimer = null
const TYPEWRITER_INTERVAL_MS = 20
const THINKING_DELAY_MS = 900
const CASE_SWITCH_DELAY_MS = 3200
const HOVER_RECHECK_DELAY_MS = 450

const ctaTarget = computed(() =>
    auth.isLoggedIn ? { name: 'Dashboard' } : { name: 'Login' },
)

const ctaLabel = computed(() =>
    auth.isLoggedIn ? t('landing.ctaDashboard') : t('landing.ctaStart'),
)

const primaryFeatures = computed(() => [
    {
        title: t('landing.features.deep.title'),
        description: t('landing.features.deep.description'),
        icon: 'brain',
    },
    {
        title: t('landing.features.cross.title'),
        description: t('landing.features.cross.description'),
        icon: 'layers',
    },
    {
        title: t('landing.features.charts.title'),
        description: t('landing.features.charts.description'),
        icon: 'chart',
    },
    {
        title: t('landing.features.toxic.title'),
        description: t('landing.features.toxic.description'),
        icon: 'shield',
    },
])

const advancedBlocks = computed(() => [
    {
        id: 'sarcasm',
        title: t('landing.content.sarcasm.title'),
        description: t('landing.content.sarcasm.description'),
        icon: 'spark',
    },
    {
        id: 'multimodal',
        title: t('landing.content.multimodal.title'),
        description: t('landing.content.multimodal.description'),
        icon: 'video',
    },
    {
        id: 'reasoning',
        title: t('landing.content.reasoning.title'),
        description: t('landing.content.reasoning.description'),
        icon: 'bulb',
    },
    {
        id: 'multilingual',
        title: t('landing.content.multilingual.title'),
        description: t('landing.content.multilingual.description'),
        icon: 'globe',
    },
])

const aiCases = computed(() => [
    {
        id: 'positive',
        message: t('landing.aiAnalysis.cases.positive.message'),
        resultKey: 'landing.demo.status.positive',
        style: 'positive',
        icon: 'check',
    },
    {
        id: 'neutral',
        message: t('landing.aiAnalysis.cases.neutral.message'),
        resultKey: 'landing.demo.status.neutral',
        style: 'neutral',
        icon: 'dot',
    },
    {
        id: 'toxic',
        message: t('landing.aiAnalysis.cases.toxic.message'),
        resultKey: 'landing.demo.status.toxic',
        style: 'toxic',
        icon: 'alert',
    },
    {
        id: 'sarcasm',
        message: t('landing.aiAnalysis.cases.sarcasm.message'),
        resultKey: 'landing.demo.status.sarcasm',
        style: 'sarcasm',
        icon: 'detective',
    },
    {
        id: 'dissatisfied',
        message: t('landing.aiAnalysis.cases.dissatisfied.message'),
        resultKey: 'landing.demo.status.irony',
        style: 'dissatisfied',
        icon: 'detective',
    },
])

const activeCaseIndex = ref(0)
const activePhase = ref('typing')
const typedMessage = ref('')
const isAiCardHovered = ref(false)

const activeCase = computed(() => aiCases.value[activeCaseIndex.value] || null)

const resultStyle = computed(() => {
    if (!activeCase.value) return ''

    if (activeCase.value.style === 'positive') {
        return {
            borderColor: 'var(--status-positive-border)',
            backgroundColor: 'var(--status-positive-bg)',
            color: 'var(--status-positive-text)',
        }
    }
    if (activeCase.value.style === 'neutral') {
        return {
            borderColor: 'var(--status-neutral-border)',
            backgroundColor: 'var(--status-neutral-bg)',
            color: 'var(--status-neutral-text)',
        }
    }
    if (activeCase.value.style === 'toxic') {
        return {
            borderColor: 'var(--status-toxic-border)',
            backgroundColor: 'var(--status-toxic-bg)',
            color: 'var(--status-toxic-text)',
        }
    }
    return {
        borderColor: 'var(--status-sarcasm-border)',
        backgroundColor: 'var(--status-sarcasm-bg)',
        color: 'var(--status-sarcasm-text)',
    }
})

const progressPercent = computed(() =>
    ((activeCaseIndex.value + 1) / aiCases.value.length) * 100,
)

const clearAiTimers = () => {
    if (typewriterTimer) {
        clearInterval(typewriterTimer)
        typewriterTimer = null
    }
    if (caseStageTimer) {
        clearTimeout(caseStageTimer)
        caseStageTimer = null
    }
}

const scheduleNextAiCase = (nextIndex, delay = CASE_SWITCH_DELAY_MS) => {
    caseStageTimer = setTimeout(() => {
        if (isAiCardHovered.value) {
            scheduleNextAiCase(nextIndex, HOVER_RECHECK_DELAY_MS)
            return
        }
        runAiCaseCycle(nextIndex)
    }, delay)
}

const runAiCaseCycle = (index = 0) => {
    clearAiTimers()
    if (!aiCases.value.length) return

    const safeIndex = index % aiCases.value.length
    const current = aiCases.value[safeIndex]
    activeCaseIndex.value = safeIndex
    typedMessage.value = ''
    activePhase.value = 'typing'

    let cursor = 0
    typewriterTimer = setInterval(() => {
        cursor += 1
        typedMessage.value = current.message.slice(0, cursor)
        if (cursor >= current.message.length) {
            clearInterval(typewriterTimer)
            typewriterTimer = null
            activePhase.value = 'thinking'
            caseStageTimer = setTimeout(() => {
                activePhase.value = 'result'
                scheduleNextAiCase((safeIndex + 1) % aiCases.value.length)
            }, THINKING_DELAY_MS)
        }
    }, TYPEWRITER_INTERVAL_MS)
}

const setupRevealObserver = () => {
    if (!landingRef.value) return

    if (revealObserver) {
        revealObserver.disconnect()
    }

    const targets = landingRef.value.querySelectorAll('[data-reveal]')
    revealObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in-view')
                }
            })
        },
        { threshold: 0.15, rootMargin: '0px 0px -40px 0px' },
    )

    targets.forEach((el, index) => {
        el.style.transitionDelay = `${Math.min(index * 70, 350)}ms`
        const rect = el.getBoundingClientRect()
        const isVisible = rect.top < window.innerHeight - 40
        if (isVisible) {
            el.classList.add('in-view')
        } else {
            el.classList.remove('in-view')
        }
        revealObserver.observe(el)
    })
}

onMounted(() => {
    setupRevealObserver()
    runAiCaseCycle(0)
})

onBeforeUnmount(() => {
    if (revealObserver) {
        revealObserver.disconnect()
    }
    clearAiTimers()
})

watch(
    () => locale.value,
    async () => {
        await nextTick()
        setupRevealObserver()
        runAiCaseCycle(activeCaseIndex.value)
    },
)
</script>

<template>
    <div
        ref="landingRef"
        class="min-h-screen bg-[var(--bg-color)] text-[var(--text-color)] transition-colors duration-300"
    >
        <section class="mx-auto max-w-7xl px-6 pt-10 pb-12 md:pt-16 md:pb-20">
            <div
                data-reveal
                class="reveal relative overflow-hidden rounded-3xl border border-[var(--border-color)] bg-linear-to-br from-[var(--hero-start)] via-[var(--hero-mid)] to-[var(--hero-end)] px-6 py-10 shadow-xl transition-colors duration-300 sm:px-10 sm:py-14"
            >
                <div
                    class="absolute -top-20 -right-24 h-56 w-56 rounded-full bg-blue-300/30 blur-3xl dark:bg-blue-600/20"
                ></div>
                <div
                    class="absolute -bottom-24 -left-24 h-60 w-60 rounded-full bg-indigo-300/30 blur-3xl dark:bg-indigo-600/20"
                ></div>

                <div class="relative z-10 flex flex-col gap-8">
                    <div
                        class="inline-flex w-fit items-center rounded-full border border-[var(--border-color)] bg-[var(--bg-card)] px-4 py-2 text-xs font-semibold tracking-wide text-[var(--primary-color)]"
                    >
                        {{ t('landing.badge') }}
                    </div>

                    <div class="max-w-3xl">
                        <h1
                            class="text-4xl font-extrabold leading-tight tracking-tight text-[var(--text-color)] sm:text-5xl lg:text-6xl"
                        >
                            {{ t('landing.titlePrefix') }}
                            <span
                                class="bg-linear-to-r from-[var(--primary-color)] to-[var(--secondary-color)] bg-clip-text text-transparent"
                            >
                                {{ t('landing.titleAccent') }}
                            </span>
                        </h1>
                        <p
                            class="mt-5 max-w-2xl text-base leading-relaxed text-[var(--text-muted)] sm:text-lg"
                        >
                            {{ t('landing.subtitle') }}
                        </p>
                    </div>

                    <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
                        <RouterLink
                            :to="ctaTarget"
                            class="inline-flex items-center justify-center rounded-xl bg-[var(--primary-color)] px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-[var(--secondary-color)]"
                        >
                            {{ ctaLabel }}
                        </RouterLink>
                        <a
                            href="#how-it-works"
                            class="inline-flex items-center justify-center rounded-xl border border-[var(--border-color)] bg-[var(--bg-card-strong)] px-6 py-3 text-sm font-semibold text-[var(--text-color)] transition hover:-translate-y-0.5 hover:bg-[var(--bg-card)]"
                        >
                            {{ t('landing.ctaDemo') }}
                        </a>
                    </div>
                </div>
            </div>
        </section>

        <section
            id="features"
            class="scroll-mt-24 mx-auto max-w-7xl px-6 pb-16 md:pb-20"
        >
            <div data-reveal class="reveal mb-8">
                <h2
                    class="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl"
                >
                    {{ t('landing.featuresTitle') }}
                </h2>
                <p class="mt-2 text-[var(--text-muted)]">
                    {{ t('landing.featuresSubtitle') }}
                </p>
            </div>

            <div class="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-4">
                <article
                    v-for="feature in primaryFeatures"
                    :key="feature.title"
                    data-reveal
                    class="reveal rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-6 shadow-lg backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                >
                    <div
                        class="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--bg-card-strong)] text-[var(--primary-color)]"
                    >
                        <svg
                            v-if="feature.icon === 'brain'"
                            class="h-6 w-6"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="1.8"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                        >
                            <path d="M9 3a3 3 0 0 0-3 3v1a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2v1a3 3 0 0 0 3 3" />
                            <path d="M15 3a3 3 0 0 1 3 3v1a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2v1a3 3 0 0 1-3 3" />
                            <path d="M9 8h6M9 12h6M12 6v12" />
                        </svg>
                        <svg
                            v-else-if="feature.icon === 'layers'"
                            class="h-6 w-6"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="1.8"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                        >
                            <path d="M12 3 3 8l9 5 9-5-9-5Z" />
                            <path d="m3 12 9 5 9-5" />
                            <path d="m3 16 9 5 9-5" />
                        </svg>
                        <svg
                            v-else-if="feature.icon === 'chart'"
                            class="h-6 w-6"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="1.8"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                        >
                            <path d="M4 19h16" />
                            <path d="M7 15v-4M12 15V7M17 15v-2" />
                            <path d="m5 10 4-4 3 3 5-5" />
                        </svg>
                        <svg
                            v-else
                            class="h-6 w-6"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="1.8"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                        >
                            <path d="M12 3 5 6v6c0 5 3.5 8 7 9 3.5-1 7-4 7-9V6l-7-3Z" />
                            <path d="m9 12 2 2 4-4" />
                        </svg>
                    </div>
                    <h3 class="text-lg font-semibold text-[var(--text-color)]">
                        {{ feature.title }}
                    </h3>
                    <p class="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">
                        {{ feature.description }}
                    </p>
                </article>
            </div>
        </section>

        <section
            id="how-it-works"
            class="scroll-mt-24 mx-auto max-w-7xl px-6 pb-16 transition-colors duration-300 md:pb-20"
        >
            <div
                data-reveal
                class="reveal grid gap-8 rounded-3xl border border-[var(--border-color)] bg-[var(--bg-card)] px-6 py-[29px] shadow-xl backdrop-blur-sm lg:grid-cols-2 lg:items-center"
            >
                <div>
                    <p
                        class="text-xs font-semibold tracking-[0.2em] text-[var(--primary-color)] uppercase"
                    >
                        {{ t('landing.aiAnalysis.badge') }}
                    </p>
                    <h3 class="mt-3 text-3xl font-extrabold leading-tight">
                        {{ t('landing.aiAnalysis.title') }}
                    </h3>
                    <p class="mt-4 text-base leading-relaxed text-[var(--text-muted)]">
                        {{ t('landing.aiAnalysis.description') }}
                    </p>
                    <p class="mt-6 text-sm font-semibold text-[var(--secondary-color)]">
                        {{ t('landing.aiAnalysis.powered') }}
                    </p>
                </div>

                <div
                    class="relative min-h-[220px] overflow-hidden rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card-strong)] p-5 shadow-inner transition-colors duration-300 hover:border-indigo-400/60"
                    @mouseenter="isAiCardHovered = true"
                    @mouseleave="isAiCardHovered = false"
                >
                    <div
                        class="h-16 overflow-hidden rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card-strong)] px-4 py-3 text-sm leading-relaxed text-[var(--text-muted)] shadow-sm"
                    >
                        {{ typedMessage }}
                        <span
                            v-if="activePhase === 'typing'"
                            class="ml-0.5 inline-block h-4 w-0.5 animate-pulse bg-[var(--secondary-color)] align-middle"
                        ></span>
                    </div>

                    <div class="mt-5">
                        <div class="mb-2 flex items-center justify-between text-xs font-semibold">
                            <span class="text-[var(--primary-color)]">{{
                                t('landing.aiAnalysis.processing')
                            }}</span>
                            <span class="text-[var(--text-muted)]"
                                >{{ activeCaseIndex + 1 }}/{{ aiCases.length }}</span
                            >
                        </div>
                        <div
                            class="h-2 overflow-hidden rounded-full bg-[var(--border-color)]"
                        >
                            <div
                                class="h-full rounded-full bg-linear-to-r from-[var(--primary-color)] to-[var(--secondary-color)] transition-all duration-500"
                                :style="{ width: `${progressPercent}%` }"
                            ></div>
                        </div>
                        <div class="mt-3 flex items-center gap-2">
                            <span
                                v-for="(example, idx) in aiCases"
                                :key="example.id"
                                class="h-2.5 w-2.5 rounded-full transition-all duration-300"
                                :class="
                                    idx === activeCaseIndex
                                        ? 'scale-115 bg-[var(--secondary-color)]'
                                        : idx < activeCaseIndex
                                          ? 'bg-indigo-300/80'
                                          : 'bg-[var(--border-color)]'
                                "
                            ></span>
                        </div>
                    </div>

                    <div class="relative mt-5 min-h-[64px]">
                        <Transition name="fade-up">
                            <div
                                v-if="activePhase === 'thinking'"
                                class="absolute inset-x-0 top-0 inline-flex w-fit items-center gap-2 rounded-full border border-[var(--border-color)] bg-[var(--bg-card)] px-3 py-1.5 text-xs font-semibold text-[var(--primary-color)]"
                            >
                                <span class="h-2 w-2 animate-ping rounded-full bg-[var(--primary-color)]"></span>
                                {{ t('landing.aiAnalysis.processing') }}
                            </div>
                        </Transition>

                        <Transition name="fade-up">
                            <div
                                v-if="activePhase === 'result' && activeCase"
                                class="result-card absolute inset-x-0 top-0 rounded-2xl border px-4 py-3 text-sm shadow-sm"
                                :style="resultStyle"
                            >
                                <span class="inline-flex items-center gap-2 font-semibold">
                                    <span
                                        v-if="activeCase.icon === 'check'"
                                        class="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[var(--status-positive-bg)] text-[var(--status-positive-text)]"
                                    >
                                        ✓
                                    </span>
                                    <span
                                        v-else-if="activeCase.icon === 'dot'"
                                        class="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[var(--status-neutral-bg)] text-[var(--status-neutral-text)]"
                                    >
                                        •
                                    </span>
                                    <span
                                        v-else-if="activeCase.icon === 'alert'"
                                        class="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[var(--status-toxic-bg)] text-[var(--status-toxic-text)]"
                                    >
                                        !
                                    </span>
                                    <span
                                        v-else
                                        class="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[var(--status-sarcasm-bg)] text-[var(--status-sarcasm-text)] detective-icon"
                                    >
                                        🕵️
                                    </span>
                                    {{ t('landing.demo.sentiment_label') }}:
                                    {{ t(activeCase.resultKey) }}
                                </span>
                            </div>
                        </Transition>
                    </div>
                </div>
            </div>
        </section>

        <section class="mx-auto max-w-7xl px-6 pb-20">
            <div class="grid grid-cols-1 gap-8 md:grid-cols-2">
                <article
                    v-for="item in advancedBlocks"
                    :key="item.id"
                    data-reveal
                    class="reveal rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-6 shadow-lg backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                >
                    <div
                        class="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--bg-card-strong)] text-[var(--secondary-color)]"
                    >
                        <svg
                            v-if="item.icon === 'spark'"
                            class="h-6 w-6"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="1.8"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                        >
                            <path d="m12 3 1.8 3.7L18 8.5l-3.1 3 0.7 4.5L12 14l-3.6 2 0.7-4.5L6 8.5l4.2-1.8L12 3Z" />
                        </svg>
                        <svg
                            v-else-if="item.icon === 'video'"
                            class="h-6 w-6"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="1.8"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                        >
                            <rect x="3" y="5" width="14" height="14" rx="2" />
                            <path d="m17 10 4-3v10l-4-3" />
                        </svg>
                        <svg
                            v-else-if="item.icon === 'bulb'"
                            class="h-6 w-6"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="1.8"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                        >
                            <path d="M9 18h6M10 22h4M8.6 14.6A6 6 0 1 1 15.4 14.6c-0.8 0.7-1.2 1.3-1.4 2.4h-4c-0.2-1.1-0.6-1.7-1.4-2.4Z" />
                        </svg>
                        <svg
                            v-else
                            class="h-6 w-6"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="1.8"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                        >
                            <circle cx="12" cy="12" r="9" />
                            <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
                        </svg>
                    </div>
                    <h3 class="text-lg font-semibold text-[var(--text-color)]">
                        {{ item.title }}
                    </h3>
                    <p class="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">
                        {{ item.description }}
                    </p>
                </article>
            </div>
        </section>

        <footer
            class="border-t border-[var(--border-color)] bg-[var(--bg-footer)] transition-colors duration-300"
        >
            <div
                class="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-6 py-10 text-sm text-[var(--text-muted)] md:grid-cols-3"
            >
                <div>
                    <div class="inline-flex items-center gap-2">
                        <span class="text-2xl font-black tracking-tight text-gray-900 dark:text-white"
                            >Mood<span
                                class="bg-linear-to-r from-[var(--primary-color)] to-[var(--secondary-color)] bg-clip-text text-transparent"
                                >Flow</span
                            ></span
                        >
                    </div>
                    <p class="mt-3 max-w-sm">
                        {{ t('landing.footer.description') }}
                    </p>
                </div>

                <div>
                    <h4 class="font-semibold text-[var(--text-color)]">
                        {{ t('landing.footer.linksTitle') }}
                    </h4>
                    <div class="mt-3 flex flex-col gap-2">
                        <a href="#features" class="transition hover:text-[var(--primary-color)]">{{
                            t('landing.footer.features')
                        }}</a>
                        <a href="#how-it-works" class="transition hover:text-[var(--primary-color)]">{{
                            t('landing.footer.demo')
                        }}</a>
                        <a href="#how-it-works" class="transition hover:text-[var(--primary-color)]">{{
                            t('landing.footer.technology')
                        }}</a>
                    </div>
                </div>

                <div>
                    <h4 class="font-semibold text-[var(--text-color)]">
                        {{ t('landing.footer.connectTitle') }}
                    </h4>
                    <div class="mt-3">
                        <a
                            href="https://github.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            class="inline-flex items-center gap-2 transition hover:text-[var(--primary-color)]"
                        >
                            {{ t('landing.footer.github') }}
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    </div>
</template>

<style scoped>
.reveal {
    opacity: 0;
    transform: translateY(28px);
    transition:
        opacity 0.7s ease,
        transform 0.7s ease;
}

.reveal.in-view {
    opacity: 1;
    transform: translateY(0);
}

.result-card {
    animation: result-pop 0.45s ease-out;
}

@keyframes result-pop {
    0% {
        opacity: 0;
        transform: translateY(6px) scale(0.985);
    }
    100% {
        opacity: 1;
        transform: translateY(0) scale(1);
    }
}

.fade-up-enter-active,
.fade-up-leave-active {
    transition: all 0.25s ease;
}

.fade-up-enter-from,
.fade-up-leave-to {
    opacity: 0;
    transform: translateY(6px);
}

.detective-icon {
    animation: detective-bounce 1.1s ease-in-out infinite;
}

@keyframes detective-bounce {
    0%,
    100% {
        transform: translateY(0);
    }
    50% {
        transform: translateY(-2px);
    }
}
</style>
