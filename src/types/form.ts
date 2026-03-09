export type FieldType = "text" | "checkbox";

export interface Field {
    id: string;
    label: string;
    type: FieldType;
    required: boolean;
    options?: string[];
}