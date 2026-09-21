import { A_LEVEL_MATHS_SUBJECTS } from "../seed.ts";

export type CourseBankMapping = {
  subjectTitle: string;
  chapterTitle: string;
  courseTopicKey: string;
};

const pureKeys = [
  "pure_1_algebra_and_functions", "pure_2_proof", "pure_3_coordinate_geometry",
  "pure_4_sequences_and_series", "pure_5_trigonometry",
  "pure_6_exponentials_and_logarithms", "pure_7_differentiation",
  "pure_8_integration", "pure_9_numerical_methods", "pure_10_vectors",
];
const mechanicsKeys = [
  "mechanics_as_1_modelling_in_mechanics", "mechanics_as_2_constant_acceleration",
  "mechanics_as_3_forces_and_motion", "mechanics_as_4_variable_acceleration",
  "mechanics_a2_1_moments", "mechanics_a2_2_forces_and_friction",
  "mechanics_a2_3_projectiles", "mechanics_a2_4_application_of_forces",
  "mechanics_a2_5_further_kinematics",
];
const statisticsKeys = [
  "statistics_as_1_data_collection", "statistics_as_2_measures_of_location_and_spread",
  "statistics_as_3_representation_of_data", "statistics_as_4_correlation",
  "statistics_as_5_probability", "statistics_as_6_statistical_distributions",
  "statistics_as_7_hypothesis_testing",
  "statistics_a2_1_regression_correlation_and_hypothesis_testing",
  "statistics_a2_2_conditional_probability", "statistics_a2_3_the_normal_distribution",
];

const keysBySubject: Record<string, readonly string[]> = {
  "Pure Mathematics": pureKeys,
  Mechanics: mechanicsKeys,
  Statistics: statisticsKeys,
};

export const COURSE_BANK_MAPPINGS: readonly CourseBankMapping[] =
  A_LEVEL_MATHS_SUBJECTS.flatMap((subject) => {
    const keys = keysBySubject[subject.title];
    if (!keys || keys.length !== subject.chapters.length) {
      throw new Error(`Incomplete question-bank mapping for ${subject.title}`);
    }
    return subject.chapters.map((chapter, index) => ({
      subjectTitle: subject.title,
      chapterTitle: chapter.title,
      courseTopicKey: keys[index],
    }));
  });

export function getCourseBankMapping(subjectTitle: string, chapterTitle: string) {
  return COURSE_BANK_MAPPINGS.find(
    (item) => item.subjectTitle === subjectTitle && item.chapterTitle === chapterTitle,
  ) ?? null;
}

export function assessmentKeyFor(mapping: CourseBankMapping) {
  return `${mapping.subjectTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}:${mapping.chapterTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`;
}
