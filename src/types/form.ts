export type FieldType = "text" | "number" | "date" | "time" | "file" | "checkbox";

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
    userId: number;
    createdAt: string;
}

export interface SharedForm {
    id: number;
    name: string;
    description?: string;
    fields: Field[];
    createdAt: string;
}

export interface SubmissionAnswer {
    fieldId: string;
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
    submittedAt: string;
}