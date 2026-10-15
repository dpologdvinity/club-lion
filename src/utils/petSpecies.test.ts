import { test } from "node:test";
import assert from "node:assert/strict";
import {
  PET_PROFILES,
  PET_SPECIES_ORDER,
  isPetSpecies,
  restorePetSpecies,
} from "./petSpecies.ts";

test("isPetSpecies accepts only the known species ids", () => {
  for (const species of PET_SPECIES_ORDER) {
    assert.equal(isPetSpecies(species), true, species);
  }
  assert.equal(isPetSpecies("wizard"), false);
  assert.equal(isPetSpecies(""), false);
  assert.equal(isPetSpecies(undefined), false);
  assert.equal(isPetSpecies(null), false);
  assert.equal(isPetSpecies(7), false);
  assert.equal(isPetSpecies("toString"), false);
  assert.equal(isPetSpecies("__proto__"), false);
});

test("restorePetSpecies keeps saved species and falls back to lion", () => {
  assert.equal(restorePetSpecies("unicorn"), "unicorn");
  assert.equal(restorePetSpecies("lion"), "lion");
  assert.equal(restorePetSpecies(undefined), "lion");
  assert.equal(restorePetSpecies("dinosaur"), "lion");
  assert.equal(restorePetSpecies({ species: "bunny" }), "lion");
});

test("every species has a label, a pet name and a reaction for each care action", () => {
  assert.equal(PET_SPECIES_ORDER.length, 8);
  for (const species of PET_SPECIES_ORDER) {
    const profile = PET_PROFILES[species];
    assert.ok(profile.label.length > 0, `${species} label`);
    assert.ok(profile.petName.length > 0, `${species} petName`);
    for (const action of ["wash", "brush", "feed", "play"] as const) {
      assert.ok(profile.reactions[action].length > 0, `${species} ${action}`);
    }
  }
  assert.equal(PET_PROFILES.lion.petName, "Leo");
});
