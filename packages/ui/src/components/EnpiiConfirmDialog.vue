<script setup>
import { useConfirm } from '../composables/useConfirm';
import AppButton from './EnpiiButton.vue';
import AppIcon from './EnpiiIcon.vue';
import AppModal from './EnpiiModal.vue';

defineProps({
    shape: {
        type: String,
        default: 'rounded',
        validator: (value) => ['rounded', 'pill', 'sharp'].includes(value),
    },
});

const { confirmState, handleConfirm, handleCancel } = useConfirm();
</script>

<template>
    <AppModal :model-value="confirmState.open" :title="confirmState.title" size="sm" :shape="shape" @update:model-value="handleCancel">
        <div class="enpii-confirm-dialog">
            <div
                class="enpii-confirm-dialog__icon"
                :class="{ 'enpii-confirm-dialog__icon--danger': confirmState.variant === 'danger' }"
            >
                <AppIcon :name="confirmState.icon" class="enpii-confirm-dialog__glyph" />
            </div>
            <p class="enpii-confirm-dialog__message">{{ confirmState.message }}</p>
        </div>
        <template #footer>
            <AppButton v-if="confirmState.cancelLabel" variant="ghost" @click="handleCancel">{{ confirmState.cancelLabel }}</AppButton>
            <AppButton :variant="confirmState.variant" @click="handleConfirm">{{ confirmState.confirmLabel }}</AppButton>
        </template>
    </AppModal>
</template>
