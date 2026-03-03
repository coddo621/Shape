export type FieldType = "text" | "textarea" | "checkbox";

export interface Field {
    id: string;
    label: string;
    type: FieldType;
    required: boolean;
}