export type FieldType = "text" | "checkbox";

export interface Field {
    id: string;
    label: string;
    type: FieldType;
    required: boolean;
    /**
     * Labels for each checkbox when the field is a checkbox group.  
     * Undefined for other field types.
     */
    options?: string[];
}