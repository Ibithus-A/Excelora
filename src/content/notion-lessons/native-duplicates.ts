import { STATISTICS_NORMAL_B_LESSONS } from "./statistics-normal-b.ts";
import { STATISTICS_NORMAL_C_LESSONS } from "./statistics-normal-c.ts";
import { STATISTICS_NORMAL_A_LESSONS } from "./statistics-normal-a.ts";
import { MECHANICS_FORCES_LESSONS } from "./mechanics-forces.ts";
import { MECHANICS_MOMENTS_LESSON } from "./mechanics-moments.ts";
import { MECHANICS_FRICTION_LESSON } from "./mechanics-friction.ts";
import { MECHANICS_APPLIED_FORCE_LESSONS } from "./mechanics-applied-forces.ts";
import { MECHANICS_PROJECTILE_LESSON } from "./mechanics-projectiles.ts";
import { PURE_NUMERICAL_LESSONS } from "./pure-numerical.ts";
import { PURE_VECTOR_LESSONS } from "./pure-vectors.ts";
import { PURE_DIFFERENTIATION_LESSONS } from "./pure-differentiation.ts";
import { PURE_INTEGRATION_LESSONS } from "./pure-integration.ts";
import { PURE_EXPONENTIAL_LESSONS } from "./pure-exponentials.ts";
import { PURE_TRIGONOMETRY_LESSONS } from "./pure-trigonometry.ts";
import { STATISTICS_CORRELATION_LESSONS } from "./statistics-correlation.ts";
import { STATISTICS_DATA_PRESENTATION_LESSONS } from "./statistics-data-presentation.ts";
import { STATISTICS_PROBABILITY_LESSONS } from "./statistics-probability.ts";
import { STATISTICS_REGRESSION_LESSONS } from "./statistics-regression.ts";
import { STATISTICS_CORRELATION_TEST_LESSON } from "./statistics-correlation-test.ts";
import { PROBABILITY_FORMULAE_LESSON } from "./statistics-probability-formulae.ts";
import { STATISTICS_CONDITIONAL_LESSONS } from "./statistics-conditional.ts";
import { STATISTICS_HYPOTHESIS_LESSONS } from "./statistics-hypothesis.ts";
import { STATISTICS_DISTRIBUTION_LESSONS } from "./statistics-distributions.ts";
import { MECHANICS_CONSTANT_ACCELERATION_LESSONS } from "./mechanics-constant-acceleration.ts";
import { SEQUENCES_SERIES_LESSONS } from "./sequences-series.ts";
import { MECHANICS_VECTOR_KINEMATICS_LESSONS } from "./mechanics-vector-kinematics.ts";
import { MECHANICS_CALCULUS_LESSONS } from "./mechanics-calculus.ts";
import { STATISTICS_LOCATION_LESSONS } from "./statistics-location.ts";
import { COORDINATE_GEOMETRY_LESSONS } from "./coordinate-geometry.ts";
import { STATISTICS_COLLECTION_LESSONS } from "./statistics-collection.ts";
import { MECHANICS_MODELLING_LESSONS } from "./mechanics-modelling.ts";
import { PROOF_STRUCTURE } from "./proof-structure.ts";
import { PROOF_LESSONS } from "./proof.ts";
import type { NativeLesson } from "../../lib/lessons/schema.ts";
export const NATIVE_DUPLICATES: readonly NativeLesson[] = [
  ...STATISTICS_PROBABILITY_LESSONS,
  ...STATISTICS_DATA_PRESENTATION_LESSONS,
  ...STATISTICS_CORRELATION_LESSONS,
  ...PURE_TRIGONOMETRY_LESSONS,
  ...PURE_EXPONENTIAL_LESSONS,
  ...PURE_DIFFERENTIATION_LESSONS,
  ...PURE_INTEGRATION_LESSONS,
  ...PURE_NUMERICAL_LESSONS,
  ...PURE_VECTOR_LESSONS,
  ...MECHANICS_FORCES_LESSONS,
  MECHANICS_MOMENTS_LESSON,
  MECHANICS_FRICTION_LESSON,
  ...MECHANICS_APPLIED_FORCE_LESSONS,
  MECHANICS_PROJECTILE_LESSON,
  ...STATISTICS_NORMAL_A_LESSONS,
  ...STATISTICS_NORMAL_B_LESSONS,
  ...STATISTICS_NORMAL_C_LESSONS,
  PROOF_STRUCTURE,
  ...PROOF_LESSONS,
  ...MECHANICS_MODELLING_LESSONS,
  ...STATISTICS_COLLECTION_LESSONS,
  ...COORDINATE_GEOMETRY_LESSONS,
  ...STATISTICS_LOCATION_LESSONS,
  ...MECHANICS_CALCULUS_LESSONS,
  ...MECHANICS_VECTOR_KINEMATICS_LESSONS,
  ...SEQUENCES_SERIES_LESSONS,
  ...MECHANICS_CONSTANT_ACCELERATION_LESSONS,
  ...STATISTICS_DISTRIBUTION_LESSONS,
  ...STATISTICS_HYPOTHESIS_LESSONS,
  ...STATISTICS_CONDITIONAL_LESSONS,
  PROBABILITY_FORMULAE_LESSON,
  ...STATISTICS_REGRESSION_LESSONS,
  STATISTICS_CORRELATION_TEST_LESSON,
];
