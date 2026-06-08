export type FieldType = "text" | "number" | "date" | "time" | "file" | "checkbox";

export type EmailCollectionOption = "do_not_collect" | "verified" | "responder_input";

export interface FormSettings {
    showProgressBar: boolean;
    shuffleQuestionOrder: boolean;
    confirmationMessage: string;
    showSubmitAnotherResponseLink: boolean;
    viewResultsSummary: boolean;
    disableAutoSave: boolean;
    allowResponseEditing: boolean;
    acceptingResponses: boolean;
    formClosedMessage: string;
    collectEmailAddresses: EmailCollectionOption;
    questionDefaultRequired: boolean;
    isQuiz: boolean;
    releaseMarksImmediately: boolean;
    showMissedQuestions: boolean;
    showCorrectAnswers: boolean;
    showPointValues: boolean;
}

export interface Field {
    id: string;
    label: string;
    type: FieldType;
    required: boolean;
    options?: string[];
}

export interface Form {
    id: number;
    name: string;
    description?: string;
    fields: Field[];
    settings?: FormSettings;
    userId: number;
    createdAt: string;
}

export interface SharedForm {
    id: number;
    name: string;
    description?: string;
    fields: Field[];
    settings?: FormSettings;
    createdAt: string;
}

export interface SubmissionAnswer {
    fieldId: string | number;
    label: string;
    value: string;
}

export interface FormSubmission {
    id: number;
    formId: number;
    formName: string;
    user: {
        id: number;
        username: string;
        email: string;
    };
    answers: SubmissionAnswer[];
    formSettings?: FormSettings;
    submittedAt: string;
    editToken?: string | null;
}