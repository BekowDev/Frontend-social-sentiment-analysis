<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const goToLogin = () => {
    router.push('/login')
}

const features = [
    {
        title: 'Умная аналитика',
        description:
            'Автоматически анализируйте отзывы, выявляйте ключевые тренды и принимайте решения на основе данных.',
    },
    {
        title: 'Сохранение истории',
        description:
            'Храните результаты прошлых анализов в одном месте и легко сравнивайте динамику метрик.',
    },
    {
        title: 'Безопасность',
        description:
            'Ваши данные защищены современными стандартами, а доступ к аккаунту контролируется авторизацией.',
    },
]
</script>

<template>
    <div class="landing">
        <header class="header">
            <div class="brand">
                <div class="brand-icon">MS</div>
                <span class="brand-name">MoodScope</span>
            </div>
            <button class="ghost-btn" @click="goToLogin">Войти</button>
        </header>

        <main>
            <section class="hero">
                <p class="hero-badge">Платформа аналитики данных и отзывов</p>
                <h1>Понимайте настроение аудитории с первого взгляда</h1>
                <p class="hero-description">
                    MoodScope помогает быстро собирать, анализировать и
                    визуализировать обратную связь, чтобы вы принимали точные
                    бизнес-решения.
                </p>
                <button class="primary-btn" @click="goToLogin">
                    Начать работу
                </button>
            </section>

            <section class="features">
                <article
                    v-for="feature in features"
                    :key="feature.title"
                    class="feature-card"
                >
                    <h3>{{ feature.title }}</h3>
                    <p>{{ feature.description }}</p>
                </article>
            </section>
        </main>

        <footer class="footer">
            <p>© {{ new Date().getFullYear() }} MoodScope. Все права защищены.</p>
        </footer>
    </div>
</template>

<style scoped>
.landing {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    background: radial-gradient(circle at top left, #eef4ff 0%, #f9fbff 45%, #ffffff 100%);
    color: #1a2453;
}

.header {
    max-width: 1120px;
    width: 100%;
    margin: 0 auto;
    padding: 24px 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.brand {
    display: flex;
    align-items: center;
    gap: 12px;
    font-weight: 700;
}

.brand-icon {
    width: 42px;
    height: 42px;
    border-radius: 12px;
    display: grid;
    place-items: center;
    color: #ffffff;
    background: linear-gradient(135deg, #4f46e5, #06b6d4);
    box-shadow: 0 10px 24px rgba(79, 70, 229, 0.3);
    font-size: 0.85rem;
    letter-spacing: 0.04em;
}

.brand-name {
    font-size: 1.1rem;
}

.hero {
    max-width: 1120px;
    width: 100%;
    margin: 0 auto;
    padding: 44px 20px 20px;
}

.hero-badge {
    display: inline-block;
    padding: 8px 14px;
    border-radius: 999px;
    background-color: #e0e7ff;
    color: #3730a3;
    font-size: 0.85rem;
    font-weight: 600;
    margin-bottom: 20px;
}

.hero h1 {
    max-width: 780px;
    font-size: clamp(2rem, 5vw, 3.4rem);
    line-height: 1.14;
    margin: 0;
}

.hero-description {
    max-width: 640px;
    margin: 20px 0 32px;
    font-size: 1.05rem;
    line-height: 1.7;
    color: #49518a;
}

.features {
    max-width: 1120px;
    width: 100%;
    margin: 0 auto;
    padding: 32px 20px 72px;
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 20px;
}

.feature-card {
    background: #ffffff;
    border: 1px solid #e5eafe;
    border-radius: 18px;
    padding: 24px;
    box-shadow: 0 12px 34px rgba(31, 57, 120, 0.08);
    transition: transform 0.25s ease, box-shadow 0.25s ease;
}

.feature-card:hover {
    transform: translateY(-6px);
    box-shadow: 0 16px 42px rgba(31, 57, 120, 0.16);
}

.feature-card h3 {
    margin: 0 0 10px;
    font-size: 1.1rem;
}

.feature-card p {
    margin: 0;
    color: #5d648f;
    line-height: 1.65;
}

.footer {
    margin-top: auto;
    padding: 18px 20px 28px;
    text-align: center;
    color: #6f76a0;
    font-size: 0.9rem;
}

.ghost-btn,
.primary-btn {
    border: none;
    border-radius: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: transform 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease;
}

.ghost-btn {
    background: #ffffff;
    color: #3c4380;
    border: 1px solid #d8def8;
    padding: 10px 18px;
}

.ghost-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 18px rgba(48, 66, 134, 0.16);
}

.primary-btn {
    background: linear-gradient(135deg, #4f46e5, #0ea5e9);
    color: #ffffff;
    font-size: 1rem;
    padding: 13px 24px;
    box-shadow: 0 14px 30px rgba(79, 70, 229, 0.34);
}

.primary-btn:hover {
    transform: translateY(-3px);
    box-shadow: 0 18px 36px rgba(79, 70, 229, 0.44);
}

.ghost-btn:active,
.primary-btn:active {
    transform: translateY(0);
}

@media (max-width: 900px) {
    .features {
        grid-template-columns: 1fr;
    }

    .hero {
        padding-top: 28px;
    }
}

@media (max-width: 600px) {
    .header {
        padding-top: 18px;
        padding-bottom: 18px;
    }

    .brand-name {
        font-size: 1rem;
    }

    .ghost-btn,
    .primary-btn {
        width: 100%;
        max-width: 260px;
    }
}
</style>
