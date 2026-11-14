 // Base shared properties
export interface BaseSchema {
  required?: boolean;
  name?: string;
  description?: string;
}


// Leaf node (single input)
export interface FormControlSchema extends BaseSchema {
  type: 'string' | 'number' | 'date';
  xsdType?: string;
  options?: string[]; // for enums (dropdowns)

  //xs:restrictions
  validators?: {
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
  };


  //xs:list
  listItemType?: string; // the type of the list
  listItemOptions?: string[]; //for enums
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

  // HTML input properties
  ui?: {
    widget?: 'text' | 'textarea' | 'select' | 'checkbox' | 'date'| 'radio'| 'number'| 'range'| 'password'| 'email';
    placeholder?: string;
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