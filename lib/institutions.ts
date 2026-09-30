import draftData from "@/content/story-institutions-draft.json";
import institutionsData from "@/content/institutions.json";
import type { InstitutionCatalog, InstitutionDraft } from "@/lib/types";

/**
 * Content skeleton for a future “governo ideal” profile.
 * Do not import this module from scoring, play, or result until that block
 * exists. Axis scoring keeps reading only content/story.json.
 * See docs/governo-ideal.md.
 */
export const institutionCatalog = {
  ...institutionsData,
  status: "skeleton" as const,
} satisfies InstitutionCatalog;

export const institutionDraft = {
  ...draftData,
  status: "draft" as const,
} satisfies InstitutionDraft;

const OPTION_MIN = 3;
const OPTION_MAX = 4;
const SCENE_MIN = 6;
const SCENE_MAX = 8;

/** Dev check: draft leans point at real options, and every option is probed. */
export function assertInstitutionDraft(
  catalog: InstitutionCatalog = institutionCatalog,
  draft: InstitutionDraft = institutionDraft,
): void {
  if (catalog.categories.length < 4 || catalog.categories.length > 5) {
    throw new Error(
      `Expected 4–5 institution categories, got ${catalog.categories.length}.`,
    );
  }

  const optionKeys = new Set<string>();
  const categoryIds = new Set<string>();

  for (const category of catalog.categories) {
    if (categoryIds.has(category.id)) {
      throw new Error(`Duplicate category id: ${category.id}`);
    }
    categoryIds.add(category.id);

    const count = category.options.length;
    if (count < OPTION_MIN || count > OPTION_MAX) {
      throw new Error(
        `Category ${category.id} has ${count} options; expected ${OPTION_MIN}–${OPTION_MAX}.`,
      );
    }

    const optionIds = new Set<string>();
    for (const option of category.options) {
      if (optionIds.has(option.id)) {
        throw new Error(`Duplicate option id in ${category.id}: ${option.id}`);
      }
      optionIds.add(option.id);
      optionKeys.add(`${category.id}:${option.id}`);
    }
  }

  const sceneCount = draft.scenes.length;
  if (sceneCount < SCENE_MIN || sceneCount > SCENE_MAX) {
    throw new Error(
      `Expected ${SCENE_MIN}–${SCENE_MAX} draft scenes, got ${sceneCount}.`,
    );
  }

  const sceneIds = new Set<string>();
  const choiceIds = new Set<string>();
  const leaned = new Set<string>();

  for (const scene of draft.scenes) {
    if (sceneIds.has(scene.id)) {
      throw new Error(`Duplicate draft scene id: ${scene.id}`);
    }
    sceneIds.add(scene.id);

    const choices = scene.choices.length;
    if (choices < OPTION_MIN || choices > OPTION_MAX) {
      throw new Error(
        `Scene ${scene.id} has ${choices} choices; expected ${OPTION_MIN}–${OPTION_MAX}.`,
      );
    }

    for (const choice of scene.choices) {
      if (choiceIds.has(choice.id)) {
        throw new Error(`Duplicate draft choice id: ${choice.id}`);
      }
      choiceIds.add(choice.id);

      for (const lean of choice.leans ?? []) {
        const key = `${lean.categoryId}:${lean.optionId}`;
        if (!optionKeys.has(key)) {
          throw new Error(`Unknown lean on ${choice.id}: ${key}`);
        }
        if (lean.strength < 0 || lean.strength > 1) {
          throw new Error(`Lean strength out of range on ${choice.id}: ${key}`);
        }
        leaned.add(key);
      }
    }
  }

  for (const key of optionKeys) {
    if (!leaned.has(key)) {
      throw new Error(`Institution option is never probed by the draft: ${key}`);
    }
  }
}
