 // Base shared properties
export interface BaseSchema {
  label?: string;
  required?: boolean;
  defaultValue?: any;
  name?: string;
  description?: string;

  validators?: {
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
  };

  ui?: {
    widget?: 'text' | 'textarea' | 'select' | 'checkbox' | 'date'| 'radio'| 'number'| 'range'| 'password'| 'email';
    placeholder?: string;

    // HTML input properties
    max?: number;
    maxlength?: number;
    min?: number;
    minlength?: number;
    pattern?: string;
    step?: number;
    size?: number;
    value?: string;
    rows?: number;
    cols?: number;
  };

  //disabled?: boolean;
  //readonly?: boolean;
}


// Leaf node (single input)
export interface FormControlSchema extends BaseSchema {
  type: 'string' | 'number' | 'date';
  xsdType?: string;
  options?: string[]; // for enums (dropdowns)

  //xs:list
  listItemType?: string; // the type of the list
  listItemOptions?: string[];
  listMinItems?: number;
  listMaxItems?: number;
  listLength?: number;
  listItemValidators?: {
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
  };
}


// Group (object / XML element with children + attributes)
export interface FormGroupSchema extends BaseSchema {
  type: 'group';

  // XML child elements
  controls: Record<string, FormSchema>;

  // XML attributes
  attributes?: Record<string, FormControlSchema>;

}


// Array (repeating elements)
export interface FormArraySchema extends BaseSchema {
  type: 'array';

  // What each item looks like
  item: FormSchema;

  minItems?: number;
  maxItems?: number;
}


// Root union type
export type FormSchema =
  | FormControlSchema
  | FormGroupSchema
  | FormArraySchema;