import { inject } from 'vue';
import { enpiiNavigationKey } from '../plugin';
import { onBeforeUnmount, onMounted, ref } from 'vue';

export function useKeyboardShortcuts() {
    const showShortcutsModal = ref(false);
    const { navigate } = inject(enpiiNavigationKey, { navigate: () => {} });

    function isInputElement(el) {
        if (!el) return false;
        const tag = el.tagName?.toLowerCase();
        return tag === 'input' || tag === 'textarea' || tag === 'select' || el.isContentEditable;
    }

    function handleKeyDown(event) {
        const isTyping = isInputElement(document.activeElement);
        const key = event.key?.toLowerCase();
        const code = event.code;

        // 1. Open Shortcuts Help Modal: (Ctrl+/ or Cmd+/) or Shift+? (when not typing)
        if (
            ((event.ctrlKey || event.metaKey) && (key === '/' || key === '?')) ||
            (!isTyping && event.shiftKey && (key === '?' || code === 'Slash'))
        ) {
            event.preventDefault();
            showShortcutsModal.value = !showShortcutsModal.value;
            return;
        }

        // 2. Escape closes shortcuts modal if open
        if (event.key === 'Escape' && showShortcutsModal.value) {
            event.preventDefault();
            showShortcutsModal.value = false;
            return;
        }

        // 3. Alt-based Quick Navigation & Actions (works everywhere, including inside inputs)
        if (event.altKey && !event.ctrlKey && !event.metaKey) {
            switch (key) {
                case 'd':
                    event.preventDefault();
                    navigate('/dashboard');
                    break;
                case 'j':
                    event.preventDefault();
                    navigate('/accounting/journals');
                    break;
                case 'l':
                    event.preventDefault();
                    navigate('/lending/loans');
                    break;
                case 'm':
                    event.preventDefault();
                    navigate('/membership/members');
                    break;
                case 'g':
                    event.preventDefault();
                    navigate('/membership/groups');
                    break;
                case 'r':
                    event.preventDefault();
                    navigate('/accounting/reports');
                    break;
                case 'b':
                    event.preventDefault();
                    navigate('/budgeting');
                    break;
                case 't':
                    event.preventDefault();
                    navigate('/accounting/period-close');
                    break;
                case 's':
                    event.preventDefault();
                    window.dispatchEvent(new CustomEvent('app:trigger-sync'));
                    break;
                case 'a':
                    event.preventDefault();
                    window.dispatchEvent(new CustomEvent('assistant:toggle'));
                    break;
                case 'n':
                    event.preventDefault();
                    window.dispatchEvent(new CustomEvent('notifications:toggle'));
                    break;
                case 'p':
                    event.preventDefault();
                    window.print();
                    break;
            }
        }
    }

    onMounted(() => {
        window.addEventListener('keydown', handleKeyDown);
    });

    onBeforeUnmount(() => {
        window.removeEventListener('keydown', handleKeyDown);
    });

    return {
        showShortcutsModal,
    };
}