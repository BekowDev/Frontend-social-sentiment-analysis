export const MOCK_DELAY_MS = 500;

export const MOCK_DEMO_URL = 'https://www.youtube.com/watch?v=moodflow-demo';

export const MOCK_KEYWORDS = [
    { word: 'fast', count: 86 },
    { word: 'buggy', count: 54 },
    { word: 'awesome update', count: 41 },
    { word: 'crash', count: 37 },
    { word: 'love it', count: 33 },
];

const TOTAL_COMMENTS = 1420;
const POSITIVE_SHARE = 68;
const NEGATIVE_SHARE = 14;
const NEUTRAL_SHARE = 18;
const TOXICITY_SCORE = 3.2;

export const MOCK_STATS = {
    total: TOTAL_COMMENTS,
    positive: Math.round((TOTAL_COMMENTS * POSITIVE_SHARE) / 100),
    negative: Math.round((TOTAL_COMMENTS * NEGATIVE_SHARE) / 100),
    neutral: Math.round((TOTAL_COMMENTS * NEUTRAL_SHARE) / 100),
    toxic: Math.round((TOTAL_COMMENTS * TOXICITY_SCORE) / 100),
    positivePercent: POSITIVE_SHARE,
    negativePercent: NEGATIVE_SHARE,
    neutralPercent: NEUTRAL_SHARE,
    toxicityScore: TOXICITY_SCORE,
};

const commentsSeed = [
    {
        comment_id: 'yt-1',
        platform: 'YouTube',
        author_name: 'Alex Rivera',
        text: 'The app feels so fast now. This is an awesome update, love it!',
        date: '2026-09-28T14:12:00.000Z',
        analysis: { sentiment: 'positive', confidence: 96, is_toxic: false },
    },
    {
        comment_id: 'tg-1',
        platform: 'Telegram',
        author_name: 'Dana K.',
        text: 'Still buggy after the patch. Fast UI, but the feed can crash on open.',
        date: '2026-09-28T15:40:00.000Z',
        analysis: { sentiment: 'negative', confidence: 88, is_toxic: false },
    },
    {
        comment_id: 'yt-2',
        platform: 'YouTube',
        author_name: 'Priya Shah',
        text: 'Love it. Notifications are fast and the new charts look clean.',
        date: '2026-09-29T09:05:00.000Z',
        analysis: { sentiment: 'positive', confidence: 94, is_toxic: false },
    },
    {
        comment_id: 'tg-2',
        platform: 'Telegram',
        author_name: 'Nurlan',
        text: 'Neutral take: the update is fine, not awesome update territory yet.',
        date: '2026-09-29T11:22:00.000Z',
        analysis: { sentiment: 'neutral', confidence: 71, is_toxic: false },
    },
    {
        comment_id: 'yt-3',
        platform: 'YouTube',
        author_name: 'Chris Nolan',
        text: 'Random crash when I export comments. Fast elsewhere, buggy here.',
        date: '2026-09-29T18:16:00.000Z',
        analysis: { sentiment: 'negative', confidence: 91, is_toxic: false },
    },
    {
        comment_id: 'tg-3',
        platform: 'Telegram',
        author_name: 'Mira',
        text: 'Love it for Telegram threads. Keyword cloud is actually useful.',
        date: '2026-09-30T08:44:00.000Z',
        analysis: { sentiment: 'positive', confidence: 93, is_toxic: false },
    },
    {
        comment_id: 'yt-4',
        platform: 'YouTube',
        author_name: 'Sam Lee',
        text: 'Watched the recap. Product looks fast, still waiting on iOS.',
        date: '2026-09-30T12:03:00.000Z',
        analysis: { sentiment: 'neutral', confidence: 68, is_toxic: false },
    },
    {
        comment_id: 'tg-4',
        platform: 'Telegram',
        author_name: 'Viktor',
        text: 'This is trash, crash loop on Android. Stop shipping buggy builds.',
        date: '2026-09-30T19:27:00.000Z',
        analysis: { sentiment: 'negative', confidence: 97, is_toxic: true },
    },
    {
        comment_id: 'yt-5',
        platform: 'YouTube',
        author_name: 'Elena Petrova',
        text: 'Awesome update for creators. Fast sentiment labels, love it.',
        date: '2026-10-01T07:18:00.000Z',
        analysis: { sentiment: 'positive', confidence: 95, is_toxic: false },
    },
    {
        comment_id: 'tg-5',
        platform: 'Telegram',
        author_name: 'Aisha',
        text: 'Can someone confirm if Excel export is still buggy?',
        date: '2026-10-01T10:51:00.000Z',
        analysis: { sentiment: 'neutral', confidence: 74, is_toxic: false },
    },
    {
        comment_id: 'yt-6',
        platform: 'YouTube',
        author_name: 'Jonah Miles',
        text: 'Love it. Dark mode plus fast search is exactly what I needed.',
        date: '2026-10-01T16:09:00.000Z',
        analysis: { sentiment: 'positive', confidence: 92, is_toxic: false },
    },
    {
        comment_id: 'tg-6',
        platform: 'Telegram',
        author_name: 'Bekzat',
        text: 'App did crash twice in a row. Otherwise the dashboard is fast.',
        date: '2026-10-02T09:33:00.000Z',
        analysis: { sentiment: 'negative', confidence: 84, is_toxic: false },
    },
    {
        comment_id: 'yt-7',
        platform: 'YouTube',
        author_name: 'Hannah Cole',
        text: 'Awesome update. Toxicity score finally feels honest.',
        date: '2026-10-02T13:47:00.000Z',
        analysis: { sentiment: 'positive', confidence: 90, is_toxic: false },
    },
    {
        comment_id: 'tg-7',
        platform: 'Telegram',
        author_name: 'Olga',
        text: 'I am just documenting the rollout. Looks stable so far.',
        date: '2026-10-02T20:02:00.000Z',
        analysis: { sentiment: 'neutral', confidence: 66, is_toxic: false },
    },
    {
        comment_id: 'yt-8',
        platform: 'YouTube',
        author_name: 'Theo Grant',
        text: 'You people are idiots if you call this ready. Crash on launch.',
        date: '2026-10-03T08:11:00.000Z',
        analysis: { sentiment: 'negative', confidence: 98, is_toxic: true },
    },
    {
        comment_id: 'tg-8',
        platform: 'Telegram',
        author_name: 'Sofia R.',
        text: 'Love it on Telegram. Fast replies, no crash after the hotfix.',
        date: '2026-10-03T11:28:00.000Z',
        analysis: { sentiment: 'positive', confidence: 89, is_toxic: false },
    },
    {
        comment_id: 'yt-9',
        platform: 'YouTube',
        author_name: 'Kenji Ito',
        text: 'Buggy filters, but the live demo is still an awesome update.',
        date: '2026-10-03T15:55:00.000Z',
        analysis: { sentiment: 'positive', confidence: 78, is_toxic: false },
    },
    {
        comment_id: 'tg-9',
        platform: 'Telegram',
        author_name: 'Arman',
        text: 'Will wait for Monday numbers. Fast enough for a demo.',
        date: '2026-10-03T18:40:00.000Z',
        analysis: { sentiment: 'neutral', confidence: 70, is_toxic: false },
    },
    {
        comment_id: 'yt-10',
        platform: 'YouTube',
        author_name: 'Laura Bennett',
        text: 'Please fix the crash on 4K videos. Everything else I love it.',
        date: '2026-10-04T06:21:00.000Z',
        analysis: { sentiment: 'negative', confidence: 82, is_toxic: false },
    },
    {
        comment_id: 'tg-10',
        platform: 'Telegram',
        author_name: 'Yulia',
        text: 'Awesome update for community managers. Fast and readable.',
        date: '2026-10-04T07:58:00.000Z',
        analysis: { sentiment: 'positive', confidence: 94, is_toxic: false },
    },
];

export const MOCK_COMMENTS = commentsSeed.map((comment) => ({
    ...comment,
    content: comment.text,
}));

export const MOCK_REACTIONS = [
    { emoji: '🔥', count: 312 },
    { emoji: '👍', count: 248 },
    { emoji: '❤️', count: 191 },
    { emoji: '😮', count: 64 },
    { emoji: '👎', count: 29 },
];

export function getMockAnalysisResult(url = MOCK_DEMO_URL) {
    const sourceUrl = String(url || MOCK_DEMO_URL).trim() || MOCK_DEMO_URL;
    const isTelegram = /t\.me|telegram/i.test(sourceUrl);

    return {
        postLink: sourceUrl,
        platform: isTelegram ? 'Telegram' : 'YouTube',
        stats: { ...MOCK_STATS },
        sentiment_stats: { ...MOCK_STATS },
        keywords: MOCK_KEYWORDS.map((item) => ({ ...item })),
        comments: MOCK_COMMENTS.map((comment) => ({ ...comment })),
        reactions: MOCK_REACTIONS.map((item) => ({ ...item })),
        aiSummary: {
            ru: 'Аудитория в целом довольна: 68% позитивных реакций. Хвалят скорость (fast) и обновление (awesome update), но 14% жалуются на buggy-поведение и crash. Токсичность низкая — 3.2%.',
            kk: 'Аудитория негізінен оң: пікірлердің 68%-ы позитивті. fast және awesome update жиі айтылады, бірақ buggy мен crash шағымдары да бар. Токсичность деңгейі 3.2%.',
            en: 'Overall sentiment is strongly positive (68%). Viewers praise a fast experience and call this an awesome update, while 14% still report a buggy crash. Toxicity stays low at 3.2%.',
        },
    };
}

export function getMockHistory() {
    return [
        {
            _id: 'demo-history-youtube',
            postLink: MOCK_DEMO_URL,
            createdAt: '2026-10-04T06:40:00.000Z',
            executionTimeMs: 1840,
        },
        {
            _id: 'demo-history-telegram',
            postLink: 'https://t.me/moodflow/128',
            createdAt: '2026-10-03T16:15:00.000Z',
            executionTimeMs: 2210,
        },
        {
            _id: 'demo-history-youtube-2',
            postLink: 'https://www.youtube.com/watch?v=moodflow-launch',
            createdAt: '2026-10-02T12:08:00.000Z',
            executionTimeMs: 1988,
        },
    ];
}

export function getMockTaskId() {
    return 'mock-task-live-demo';
}

export function createDemoAuthToken() {
    const encode = (value) =>
        btoa(JSON.stringify(value))
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/g, '');

    return `${encode({ alg: 'none', typ: 'JWT' })}.${encode({
        id: 'demo-user',
        email: 'demo@moodflow.app',
        role: 'demo',
    })}.demo`;
}

export function isMockEnabled() {
    const viteFlag = String(import.meta.env.VITE_USE_MOCK || '').toLowerCase();
    const reactFlag = String(import.meta.env.REACT_APP_USE_MOCK || '').toLowerCase();
    return ['true', '1', 'yes'].includes(viteFlag) || ['true', '1', 'yes'].includes(reactFlag);
}
