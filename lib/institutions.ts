import draftData from "@/content/story-institutions-draft.json";
import institutionsData from "@/content/institutions.json";
import storyData from "@/content/story.json";
import type {
  InstitutionCatalog,
  InstitutionCategory,
  InstitutionDraft,
  InstitutionLean,
  InstitutionPick,
  Scene,
} from "@/lib/types";

/**
 * Ideal-government quiz, separate from the ten-axis profile.
 * Axis scoring does not read this module. Leans are summed here.
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

/**
 * The category stays open when the runner-up reaches this fraction of the
 * leader. 0.8 keeps a 0.9 vs 0.75 split open and lets 0.9 vs 0.5 decide.
 */
export const INSTITUTION_CLOSE_RATIO = 0.8;

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

type StoryChoice = { id: string; leans?: InstitutionLean[] };
type StoryScene = { id: string; choices: StoryChoice[] };

function liveStoryScenes(): StoryScene[] {
  return storyData.scenes as StoryScene[];
}

/** Choice and scene ids must stay unique across the 40 scenes and the draft. */
function assertNoIdCollision(): void {
  const sceneIds = new Set<string>();
  const choiceIds = new Set<string>();

  for (const scene of liveStoryScenes()) {
    if (sceneIds.has(scene.id)) {
      throw new Error(`Duplicate story scene id: ${scene.id}`);
    }
    sceneIds.add(scene.id);
    for (const choice of scene.choices) {
      if (choiceIds.has(choice.id)) {
        throw new Error(`Duplicate story choice id: ${choice.id}`);
      }
      choiceIds.add(choice.id);
    }
  }

  for (const scene of institutionDraft.scenes) {
    if (sceneIds.has(scene.id)) {
      throw new Error(`Institution scene id collides with the story: ${scene.id}`);
    }
    sceneIds.add(scene.id);
    for (const choice of scene.choices) {
      if (choiceIds.has(choice.id)) {
        throw new Error(
          `Institution choice id collides with the story: ${choice.id}`,
        );
      }
      choiceIds.add(choice.id);
    }
  }
}

function toPlayScene(scene: InstitutionDraft["scenes"][number]): Scene {
  return {
    id: scene.id,
    title: scene.title,
    body: scene.body,
    choices: scene.choices.map((choice) => ({
      id: choice.id,
      label: choice.label,
      hint: choice.hint,
      weights: choice.weights,
      salience: choice.salience,
    })),
  };
}

/** All arrangement dilemmas, in draft order. Not part of rápido/padrão/completo. */
export function institutionPlayScenes(): Scene[] {
  return institutionDraft.scenes.map(toPlayScene);
}

const leansByChoiceId = new Map<string, InstitutionLean[]>();

function indexLeans(): void {
  const add = (choiceId: string, leans: InstitutionLean[] | undefined) => {
    if (!leans || leans.length === 0) return;
    if (leansByChoiceId.has(choiceId)) {
      throw new Error(`Leans registered twice for choice ${choiceId}.`);
    }
    leansByChoiceId.set(choiceId, leans);
  };

  for (const scene of liveStoryScenes()) {
    for (const choice of scene.choices) add(choice.id, choice.leans);
  }
  for (const scene of institutionDraft.scenes) {
    for (const choice of scene.choices) add(choice.id, choice.leans);
  }
}

/**
 * Sum leans per category and crown a winner.
 * A near tie, or no lean at all, leaves the category open.
 */
export function scoreInstitutions(
  choiceIds: readonly string[],
): InstitutionPick[] {
  const totals = new Map<string, Map<string, number>>();
  const seen = new Set<string>();

  for (const choiceId of choiceIds) {
    if (seen.has(choiceId)) continue;
    seen.add(choiceId);
    const leans = leansByChoiceId.get(choiceId);
    if (!leans) continue;
    for (const lean of leans) {
      let byOption = totals.get(lean.categoryId);
      if (!byOption) {
        byOption = new Map();
        totals.set(lean.categoryId, byOption);
      }
      byOption.set(
        lean.optionId,
        (byOption.get(lean.optionId) ?? 0) + lean.strength,
      );
    }
  }

  return institutionCatalog.categories.map((category) =>
    pickCategory(category, totals.get(category.id)),
  );
}

function pickCategory(
  category: InstitutionCategory,
  byOption: Map<string, number> | undefined,
): InstitutionPick {
  const ranked = category.options
    .map((option, index) => ({
      id: option.id,
      index,
      support: byOption?.get(option.id) ?? 0,
    }))
    .filter((row) => row.support > 0)
    .sort((a, b) => b.support - a.support || a.index - b.index);

  const top = ranked[0];
  if (!top) {
    return {
      categoryId: category.id,
      optionId: null,
      support: 0,
      open: true,
    };
  }

  const runnerUp = ranked[1];
  const close =
    !!runnerUp &&
    runnerUp.support >= top.support * INSTITUTION_CLOSE_RATIO - 1e-9;

  return {
    categoryId: category.id,
    optionId: top.id,
    support: top.support,
    open: close,
    runnerUpOptionId: close && runnerUp ? runnerUp.id : null,
  };
}

assertInstitutionDraft();
assertNoIdCollision();
indexLeans();
