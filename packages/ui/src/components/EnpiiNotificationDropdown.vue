<script setup>
import { computed, inject, nextTick, onBeforeUnmount, onMounted, ref } from 'vue';
import { enpiiNavigationKey } from '../plugin';
import AppIcon from './EnpiiIcon.vue';
import { useShape } from '../composables/useShape';
import { useT } from '../composables/useT'

const t = useT()

const open = ref(false);
const activeTab = ref('all'); // 'all' | 'unread'
const loading = ref(false);
const items = ref([]);
const unreadCount = ref(0);
const dropdownRef = ref(null);
const trigger = ref(null);
const panel = ref(null);
const placeAbove = ref(false);
const panelStyle = ref({
    position: 'fixed',
    top: '0px',
    left: '0px',
    width: '0px',
    zIndex: 50,
    visibility: 'hidden',
});
const notifiedIds = ref(new Set());
const navigation = inject(enpiiNavigationKey, { navigate: () => {} });
const emit = defineEmits(['navigate']);
const props = defineProps({
    shape: {
        type: String,
        default: 'rounded',
        validator: (value) => ['rounded', 'pill', 'sharp'].includes(value),
    },
});

const shapeClass = useShape(props);
let pollTimer = null;

const iconTones = {
    warning: 'warning',
    danger: 'error',
    info: 'info',
    success: 'success',
};

async function fetchNotifications(isPolling = false) {
    if (!isPolling) {
        loading.value = true;
    }
    try {
        const res = await fetch('/api/notifications', {
            headers: { Accept: 'application/json' },
            credentials: 'same-origin',
        });
        if (res.ok) {
            const data = await res.json();
            const newItems = data.items || [];
            items.value = newItems;
            unreadCount.value = data.unread_count || 0;

            if (typeof window !== 'undefined' && window.desktopAPI?.sendNotification) {
                newItems.forEach((item) => {
                    if (!item.read && !notifiedIds.value.has(item.id)) {
                        notifiedIds.value.add(item.id);
                        if (isPolling) {
                            window.desktopAPI.sendNotification({
                                title: item.title,
                                body: item.message,
                                url: item.target_url || '/dashboard',
                            });
                        }
                    }
                });
            }
        }
    } catch (e) {
        console.error('Failed to fetch notifications:', e);
    } finally {
        if (!isPolling) {
            loading.value = false;
        }
    }
}

const filteredItems = computed(() => {
    if (activeTab.value === 'unread') {
        return items.value.filter((item) => !item.read);
    }
    return items.value;
});

async function markAsRead(id = null) {
    const allItemIds = items.value.map((i) => i.id);
    if (id) {
        const target = items.value.find((i) => i.id === id);
        if (target) target.read = true;
    } else {
        items.value.forEach((i) => { i.read = true; });
    }
    unreadCount.value = items.value.filter((i) => !i.read).length;

    try {
        await fetch('/api/notifications/mark-read', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
            },
            credentials: 'same-origin',
            keepalive: true,
            body: JSON.stringify({ id, ids: id ? null : allItemIds }),
        });
    } catch (e) {
        console.error('Failed to mark read:', e);
    }
}

async function handleItemClick(item) {
    open.value = false;
    if (!item.read) {
        await markAsRead(item.id);
    }
    if (item.target_url) {
        navigation.navigate(item.target_url);
        emit('navigate', item.target_url);
    }
}

function navigate(path) {
    open.value = false;
    navigation.navigate(path);
    emit('navigate', path);
}

function toggleDropdown(e) {
    if (e) {
        e.stopPropagation();
    }
    open.value = !open.value;
    if (open.value) {
        fetchNotifications();
        nextTick(() => positionPanel());
    }
}

function positionPanel() {
    if (!open.value || !trigger.value) return;

    const margin = 12;
    const triggerRect = trigger.value.getBoundingClientRect();
    const panelRect = panel.value?.getBoundingClientRect();
    const panelWidth = panelRect?.width || Math.min(384, window.innerWidth - margin * 2);
    const estimatedHeight = panelRect?.height || (items.value.length ? 480 : 160);
    const spaceBelow = window.innerHeight - triggerRect.bottom - margin;
    const spaceAbove = triggerRect.top - margin;

    placeAbove.value = spaceBelow < estimatedHeight && spaceAbove > spaceBelow;
    const maxHeight = Math.max(120, placeAbove.value ? spaceAbove : spaceBelow);
    const left = Math.min(Math.max(margin, triggerRect.right - panelWidth), window.innerWidth - panelWidth - margin);

    panelStyle.value = placeAbove.value
        ? {
            position: 'fixed',
            top: 'auto',
            bottom: `${window.innerHeight - triggerRect.top + margin}px`,
            left: `${left}px`,
            width: `${panelWidth}px`,
            maxHeight: `${maxHeight}px`,
            zIndex: 50,
            visibility: 'visible',
        }
        : {
            position: 'fixed',
            top: `${triggerRect.bottom + margin}px`,
            bottom: 'auto',
            left: `${left}px`,
            width: `${panelWidth}px`,
            maxHeight: `${maxHeight}px`,
            zIndex: 50,
            visibility: 'visible',
        };
}

function onViewportChange() {
    if (open.value) positionPanel();
}

function handleClickOutside(e) {
    if (!open.value) return;
    const path = e.composedPath ? e.composedPath() : [];
    if (dropdownRef.value && (dropdownRef.value.contains(e.target) || path.includes(dropdownRef.value))) {
        return;
    }
    open.value = false;
}

onMounted(() => {
    fetchNotifications();
    document.addEventListener('click', handleClickOutside);
    window.addEventListener('notifications:toggle', toggleDropdown);
    window.addEventListener('resize', onViewportChange);
    window.addEventListener('scroll', onViewportChange, true);

    pollTimer = setInterval(() => {
        if (typeof document !== 'undefined' && !document.hidden) {
            fetchNotifications(true);
        }
    }, 45000);
});

onBeforeUnmount(() => {
    document.removeEventListener('click', handleClickOutside);
    window.removeEventListener('notifications:toggle', toggleDropdown);
    window.removeEventListener('resize', onViewportChange);
    window.removeEventListener('scroll', onViewportChange, true);
    if (pollTimer) {
        clearInterval(pollTimer);
    }
});
</script>

<template>
    <div ref="dropdownRef" class="enpii-notification-dropdown__anchor relative" @click.stop>
        <button
            type="button"
            ref="trigger"
            class="enpii-notification-dropdown__trigger grid h-10 w-10 place-items-center rounded-full border-0 bg-transparent text-on-surface-variant transition-all duration-fast ease-emphasized hover:bg-surface-container hover:text-primary active:scale-90 focus-visible:outline focus-visible:outline-3 focus-visible:outline-focus focus-visible:outline-offset-2 aria-expanded:bg-surface-container aria-expanded:text-primary"
            :aria-label="t('notification.ariaLabel')"
            :aria-expanded="open"
            @click="toggleDropdown"
        >
            <AppIcon name="notifications" class="enpii-notification-dropdown__icon h-6 w-6 text-base" />
            <span
                v-if="unreadCount > 0"
                class="enpii-notification-dropdown__badge absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-error text-on-error text-[.625rem] font-semibold shadow-[0_0_0_2px_var(--color-surface)]"
            >
                {{ unreadCount > 9 ? '9+' : unreadCount }}
            </span>
        </button>

        <!-- Dropdown Menu -->
        <Transition name="dropdown">
                        <div
                ref="panel"
                class="enpii-notification-dropdown__panel overflow-hidden rounded-control border border-outline-variant bg-surface-container-lowest shadow-overlay transition-opacity transition-transform duration-normal ease-decelerate"
                :class="[shapeClass, { 'enpii-notification-dropdown__panel--above': placeAbove }]"
                :style="panelStyle"
                @click.stop
            >
                <!-- Header -->
                <div class="enpii-notification-dropdown__header flex items-center justify-between gap-2 border-b border-outline-variant bg-surface-container-low/80 px-4 py-3">
                    <div class="enpii-notification-dropdown__title-group flex min-w-0 items-center gap-2">
                        <AppIcon name="notifications" class="enpii-notification-dropdown__title-icon text-primary-text text-[1.125rem]" />
                        <h3 class="enpii-notification-dropdown__title m-0 flex items-center gap-2 text-primary-text text-sm font-semibold">{{ t('notification.title') }}</h3>
                        <span v-if="unreadCount > 0" class="enpii-notification-dropdown__count rounded-full bg-error/15 px-2 py-1 text-danger-text text-[.625rem] font-semibold">
                            {{ t('notification.newCount', { count: unreadCount }) }}
                        </span>
                    </div>
                    <button
                        v-if="unreadCount > 0"
                        type="button"
                        class="enpii-notification-dropdown__mark-read inline-flex min-h-10 items-center border-0 bg-none text-primary-text text-xs font-semibold cursor-pointer focus-visible:outline-none focus-visible:[box-shadow:var(--shadow-focus)]"
                        @click.stop="markAsRead(null)"
                    >
                        {{ t('notification.markAllRead') }}
                    </button>
                </div>

                <!-- Tabs Filter -->
                <div class="enpii-notification-dropdown__tabs flex border-b border-outline-variant bg-surface-container-lowest px-2">
                    <button
                        type="button"
                        class="enpii-notification-dropdown__tab flex-1 min-h-11 cursor-pointer border-0 border-b-2 border-b-transparent bg-none pb-2 pt-2 text-on-surface-variant text-xs font-semibold focus-visible:outline-none focus-visible:[box-shadow:inset_0_0_0_2px_var(--color-focus)]"
                        :class="{ 'border-b-primary text-primary-text': activeTab === 'all' }"
                        @click.stop="activeTab = 'all'"
                    >
                        Semua ({{ items.length }})
                    </button>
                    <button
                        type="button"
                        class="enpii-notification-dropdown__tab flex-1 min-h-11 cursor-pointer border-0 border-b-2 border-b-transparent bg-none pb-2 pt-2 text-on-surface-variant text-xs font-semibold focus-visible:outline-none focus-visible:[box-shadow:inset_0_0_0_2px_var(--color-focus)]"
                        :class="{ 'border-b-primary text-primary-text': activeTab === 'unread' }"
                        @click.stop="activeTab = 'unread'"
                    >
                        {{ t('notification.tabUnread', { count: unreadCount }) }}
                    </button>
                </div>

                <!-- List Content -->
                <div class="enpii-notification-dropdown__list max-h-96 overflow-y-auto">
                    <div v-if="loading && items.length === 0" class="enpii-notification-dropdown__status px-4 py-8 text-center text-on-surface-variant text-xs">
                        {{ t('notification.loading') }}
                    </div>
                    <div v-else-if="filteredItems.length === 0" class="enpii-notification-dropdown__status px-4 py-8 text-center text-on-surface-variant text-xs">
                        {{ activeTab === 'unread' ? t('notification.emptyUnread') : t('notification.emptyAll') }}
                    </div>
                    <div
                        v-for="item in filteredItems"
                        :key="item.id"
                        role="button"
                        tabindex="0"
                        :aria-disabled="item.read && undefined"
                        @keydown.enter.prevent="handleItemClick(item)"
                        @keydown.space.prevent="handleItemClick(item)"
                        class="enpii-notification-dropdown__item group/item flex cursor-pointer items-center gap-3 px-4 py-3 text-left transition-colors duration-fast ease-emphasized hover:bg-surface-container-low focus-visible:bg-surface-container-low focus-visible:outline-none focus-visible:[box-shadow:inset_0_0_0_2px_var(--color-focus)]"
                        :class="{ 'bg-primary/5': !item.read }"
                        @click="handleItemClick(item)"
                    >
                        <!-- Icon Circle -->
                        <AppIcon
                            :name="item.icon || 'info'"
                            :tone="iconTones[item.variant] || 'info'"
                            container-size="9"
                            container-shape="pill"
                            class="enpii-notification-dropdown__item-state flex items-center pl-1"
                        />

                        <!-- Main Content -->
                        <div class="enpii-notification-dropdown__item-body min-w-0 flex-1">
                            <div class="enpii-notification-dropdown__item-top flex items-center justify-between gap-2">
                                <p class="enpii-notification-dropdown__item-title m-0 truncate text-primary-text text-xs font-semibold">{{ item.title }}</p>
                                <span class="enpii-notification-dropdown__item-time shrink-0 text-on-surface-variant text-[.625rem]" :class="!item.read && ''">{{ item.time }}</span>
                            </div>
                            <p class="enpii-notification-dropdown__item-message m-0 line-clamp-2 overflow-hidden text-on-surface-variant text-xs leading-normal">{{ item.message }}</p>

                            <!-- Subtle metadata (actor if recorded by someone) -->
                            <div v-if="item.actor" class="enpii-notification-dropdown__item-actor pt-1 text-outline text-[.625rem]">
                                Oleh <span class="enpii-notification-dropdown__item-actor-name">{{ item.actor }}</span>
                            </div>
                        </div>

                        <!-- Right Chevron / Unread Indicator -->
                        <div class="enpii-notification-dropdown__item-state flex items-center pl-1">
                            <span v-if="!item.read" class="enpii-notification-dropdown__dot h-2 w-2 rounded-full bg-primary" />
                            <AppIcon v-else name="chevron_right" class="enpii-notification-dropdown__chevron text-outline opacity-0 transition-opacity duration-fast ease-emphasized [.enpii-notification-dropdown__item:hover_&]:opacity-100" />
                        </div>
                    </div>
                </div>

                <!-- Footer -->
                <div class="enpii-notification-dropdown__footer flex items-center justify-between border-t border-outline-variant bg-surface-container-low/50 px-4 py-2 text-xs font-semibold">
                    <button type="button" class="enpii-notification-dropdown__footer-link inline-flex items-center gap-1 border-0 bg-none text-primary-text hover:underline" @click.stop="navigate('/notifications/billing')">
                        <AppIcon name="chat" />
                        {{ t('notification.whatsappReminder') }}
                    </button>
                    <button type="button" class="enpii-notification-dropdown__footer-link inline-flex items-center gap-1 border-0 bg-none text-on-surface-variant hover:text-primary-text hover:underline" @click.stop="navigate('/billing/invoices')">
                        <AppIcon name="receipt" />
                        {{ t('notification.enpiiBilling') }}
                    </button>
                </div>
            </div>
        </Transition>
    </div>
</template>
