import { computed, inject } from 'vue';
import { enpiiPermissionsKey } from '../plugin';

/**
 * Tenant RBAC helper.
 * - no permissions / empty = legacy unrestricted (full access)
 * - includes '*' = full access
 */
export function useCan() {
    const injected = inject(enpiiPermissionsKey, []);
    const permissions = computed(() => Array.from(injected instanceof Set ? injected : (injected || [])));

    function can(permission) {
        if (!permission) return true;
        const perms = permissions.value;
        if (!perms.length) return true;
        if (perms.includes('*')) return true;
        return Array.isArray(permission) ? permission.some((item) => perms.includes(item)) : perms.includes(permission);
    }

    function canAll(list) {
        return !Array.isArray(list) || !list.length || list.every((permission) => can(permission));
    }

    return { can, canAll, permissions };
}
