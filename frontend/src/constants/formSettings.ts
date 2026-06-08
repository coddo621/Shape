import type { FormSettings } from "@/types/form"

export const DEFAULT_FORM_SETTINGS: FormSettings = {
  showProgressBar: false,
  shuffleQuestionOrder: false,
  confirmationMessage: "Thank you! Your response has been recorded.",
  showSubmitAnotherResponseLink: false,
  viewResultsSummary: false,
  disableAutoSave: false,
  allowResponseEditing: false,
  acceptingResponses: true,
  formClosedMessage: "This registration is now closed.",
  collectEmailAddresses: "do_not_collect",
  questionDefaultRequired: false,
  isQuiz: false,
  releaseMarksImmediately: true,
  showMissedQuestions: false,
  showCorrectAnswers: false,
  showPointValues: false,
}
