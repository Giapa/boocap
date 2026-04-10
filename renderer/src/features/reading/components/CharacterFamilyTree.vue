<script setup lang="ts">
import { computed } from "vue";
import type {
    CharacterFamilyConnection,
    CharacterFamilyTree,
    FamilyConnectionType,
} from "../../../../../shared/types";
import BaseButton from "../../../shared/components/BaseButton.vue";
import BaseInput from "../../../shared/components/BaseInput.vue";
import BaseSpinner from "../../../shared/components/BaseSpinner.vue";

interface ConnectionGroup {
    key: string;
    title: string;
    emptyLabel: string;
    roles: FamilyConnectionType[];
}

const props = withDefaults(
    defineProps<{
        query: string;
        tree: CharacterFamilyTree | null;
        loading?: boolean;
        error?: string;
    }>(),
    {
        loading: false,
        error: "",
    },
);

defineEmits<{
    "update:query": [value: string];
    search: [];
    clear: [];
}>();

const groups: ConnectionGroup[] = [
    {
        key: "ancestors",
        title: "Ancestors",
        emptyLabel: "No ancestors stored.",
        roles: ["grandparent", "parent", "guardian"],
    },
    {
        key: "immediate",
        title: "Immediate Family",
        emptyLabel: "No immediate family stored.",
        roles: ["sibling", "spouse"],
    },
    {
        key: "descendants",
        title: "Descendants",
        emptyLabel: "No descendants stored.",
        roles: ["child", "grandchild", "ward"],
    },
    {
        key: "extended",
        title: "Extended Family",
        emptyLabel: "No extended family stored.",
        roles: ["aunt_uncle", "cousin", "niece_nephew"],
    },
];

function relationshipLabel(relationship: FamilyConnectionType): string {
    switch (relationship) {
        case "aunt_uncle":
            return "Aunt / Uncle";
        case "grandparent":
            return "Grandparent";
        case "grandchild":
            return "Grandchild";
        case "niece_nephew":
            return "Niece / Nephew";
        default:
            return relationship.charAt(0).toUpperCase() + relationship.slice(1);
    }
}

function groupConnectionsByRole(roles: FamilyConnectionType[]): CharacterFamilyConnection[] {
    return (props.tree?.connections ?? []).filter((connection) =>
        roles.includes(connection.relationshipToRoot),
    );
}

const groupedConnections = computed(() =>
    groups.map((group) => ({
        ...group,
        connections: groupConnectionsByRole(group.roles),
    })),
);

const hasConnections = computed(() => (props.tree?.connections.length ?? 0) > 0);
</script>

<template>
    <section
        class="rounded-[2rem] border border-white/10 bg-slate-950/55 p-6 shadow-2xl shadow-slate-950/20 backdrop-blur">
        <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
                <p class="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                    Character search
                </p>
                <h2 class="mt-3 text-2xl font-semibold tracking-tight text-white">Family tree</h2>
                <p class="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
                    Search a character already extracted from this book. The links below are stored from
                    chapter analysis and may be incomplete if the relationship was never stated.
                </p>
            </div>
            <span class="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-slate-300">
                DB-backed
            </span>
        </div>

        <form class="mt-6 grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end" @submit.prevent="$emit('search')">
            <BaseInput :model-value="query" label="Character name" placeholder="Search within this book"
                help-text="Search is case-insensitive and prefers exact matches before partial matches."
                @update:model-value="$emit('update:query', $event)" />
            <div class="flex h-full flex-wrap items-end gap-3 lg:self-end">
                <BaseButton type="submit" :loading="loading" label="Build tree" />
                <BaseButton label="Clear" variant="ghost" :disabled="!query && !tree" @click="$emit('clear')" />
            </div>
        </form>

        <div v-if="loading" class="mt-8 flex items-center gap-3">
            <BaseSpinner label="Building family tree" />
            <p class="text-sm text-slate-400">Searching stored character links…</p>
        </div>

        <div v-else-if="error"
            class="mt-8 rounded-2xl border border-rose-400/25 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
            {{ error }}
        </div>

        <template v-else-if="tree">
            <div class="mt-8 flex justify-center">
                <div
                    class="rounded-[1.75rem] border border-sky-300/30 bg-sky-300/12 px-6 py-5 text-center shadow-lg shadow-slate-950/30">
                    <p class="text-xs font-semibold uppercase tracking-[0.3em] text-sky-100/80">
                        Root character
                    </p>
                    <h3 class="mt-3 text-2xl font-semibold text-white">{{ tree.matchedCharacter }}</h3>
                    <p v-if="tree.matchedCharacter !== tree.searchedName" class="mt-2 text-sm text-slate-300">
                        Showing the closest stored match for “{{ tree.searchedName }}”.
                    </p>
                </div>
            </div>

            <div v-if="!hasConnections"
                class="mt-8 rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm text-slate-300">
                This character exists in the database, but no family links have been stored yet.
            </div>

            <div v-else class="mt-8 grid gap-4 xl:grid-cols-4">
                <section v-for="group in groupedConnections" :key="group.key"
                    class="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div class="flex items-center justify-between gap-3">
                        <h4 class="text-sm font-semibold uppercase tracking-[0.2em] text-slate-300">
                            {{ group.title }}
                        </h4>
                        <span class="text-xs text-slate-500">{{ group.connections.length }}</span>
                    </div>

                    <div v-if="group.connections.length > 0" class="mt-4 space-y-3">
                        <article v-for="connection in group.connections"
                            :key="`${group.key}-${connection.relationshipToRoot}-${connection.relativeName}`"
                            class="rounded-2xl border border-white/8 bg-slate-950/65 p-3">
                            <div class="flex items-start justify-between gap-3">
                                <p class="text-sm font-semibold text-white">{{ connection.relativeName }}</p>
                                <span
                                    class="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-slate-400">
                                    {{ relationshipLabel(connection.relationshipToRoot) }}
                                </span>
                            </div>
                            <p class="mt-2 text-xs leading-5 text-slate-400">{{ connection.evidence }}</p>
                            <p class="mt-2 text-[11px] uppercase tracking-[0.2em] text-slate-500">
                                Chapter {{ connection.chapterIndex + 1 }} · {{ connection.confidence }} confidence
                            </p>
                        </article>
                    </div>

                    <p v-else class="mt-4 text-sm text-slate-500">{{ group.emptyLabel }}</p>
                </section>
            </div>
        </template>

        <p v-else class="mt-8 text-sm text-slate-500">
            Search for a character from this book to generate a stored family tree.
        </p>
    </section>
</template>
