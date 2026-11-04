import { Component, ElementRef, inject, OnInit,ChangeDetectorRef } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {XMLParser} from "fast-xml-parser";
import {FormGroup, FormControl, FormArray, Validators, AbstractControl, ReactiveFormsModule} from '@angular/forms';
import { CommonModule,KeyValue  } from '@angular/common';


@Component({
  standalone: true,
  selector: 'app-root',
  imports: [CommonModule,RouterOutlet,ReactiveFormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit{
  private elementRef = inject(ElementRef);
  private cdr = inject(ChangeDetectorRef);
  data!:string;
  form!: FormGroup;
  schema!: FormSchema;
  xmlOutput = '';
  showValidationErrors = false;
  radioGroupNames = new WeakMap<AbstractControl, string>();
  radioGroupCounter = 0;


  async ngOnInit(): Promise<void> {
    await this.loadFile();
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix : "@_",
      removeNSPrefix: true,
      isArray: (name:any) => ['element', 'attribute', 'enumeration'].includes(name)
    });
    const jObj = parser.parse(this.data);
    this.schema=parseXsd(jObj);
    console.log('SCHEMA:', JSON.stringify(this.schema, null, 2));
    this.form =buildForm(this.schema) as FormGroup;
    console.log('SCHEMA:', this.schema);
    //console.log('FORM:', this.form);
    //console.log('FORM CONTROLS:', this.form.controls);
    //console.log('FORM VALUE:', this.form.value);
    //console.log('IS FORMGROUP:', this.form instanceof FormGroup);
    this.cdr.detectChanges();
    };

  async loadFile() {
    const response = await fetch('assets/clothing.xsd');
    if (!response.ok) {
      throw new Error('Failed to load file');
    }
    this.data = await response.text();
  };

  asGroup(ctrl: AbstractControl): FormGroup {
    return ctrl as FormGroup;
  }

  asArray(ctrl: AbstractControl): FormArray {
    return ctrl as FormArray;
  }

  asControl(ctrl: AbstractControl): FormControl {
    return ctrl as FormControl;
  }

  getControl(group: AbstractControl, key: string | number | symbol): AbstractControl {
    return (group as FormGroup).get(String(key))!;
  }

  getAttributeControl(group: AbstractControl, key: string | number | symbol): AbstractControl {
    return (group as FormGroup).get('@' + String(key))!;
  }

  getRadioGroupName(control: AbstractControl): string {
    let name = this.radioGroupNames.get(control);

    if (!name) {
      name = `radio-group-${++this.radioGroupCounter}`;
      this.radioGroupNames.set(control, name);
    }
    return name;
  }

  // ---- array helper ----

  trackByKey(index: number, item: [string, FormSchema]): string {
    return item[0];
  }

  trackByAttribute(index: number, item: KeyValue<string | number | symbol, any>): string | number | symbol {
    return item.key;
  }

  addItem(array: FormArray, schema: FormSchema) {
    const arraySchema = schema as FormArraySchema;

    const maxItems = arraySchema.maxItems;

    if (maxItems !== undefined && array.length >= maxItems) {
      return;
    }

    array.push(buildForm(arraySchema.item));
  }

  removeItem(array: FormArray, schema: FormSchema, index: number) {
    const arraySchema = schema as FormArraySchema;

    const minItems = arraySchema.minItems ?? 0;

    if (array.length <= minItems) {
      return;
    }

    array.removeAt(index);
  }

  generateXmlOutput(): void {
    // If they dont exist dont bother
    if (!this.form || !this.schema) {
      return;
    }
    // Run validation and display errors
    this.showValidationErrors = true;
    this.form.markAllAsTouched();
    this.form.updateValueAndValidity();

    // Stop if the form is invalid
    if (this.form.invalid) {
      this.xmlOutput = '';
      //this.cdr.detectChanges();
      return;
    }

    // Generate XML only when the form is valid
    this.xmlOutput = generateXml(
      this.schema,
      this.form.value
    );
  }

  getSimpleControls(controls: Record<string, FormSchema>): [string, FormSchema][] {
    return Object.entries(controls)
      .filter(([_, schema]) => schema.type !== 'array' && schema.type !== 'group');
  }

  getArrayControls(controls: Record<string, FormSchema>): [string, FormSchema][] {
    return Object.entries(controls)
      .filter(([_, schema]) => schema.type === 'array');
  }

  getComplexControls(controls: Record<string, FormSchema>): [string, FormSchema][] {
    return Object.entries(controls)
      .filter(([_, schema]) => schema.type === 'group');
  }

  selectCheckboxOption(control: FormControl, option: string): void {
    if (control.value === option) 
      { control.setValue(null); } 
    else 
      { control.setValue(option); }
  }
}


function findByKey(obj :any, key:string, value:string) {
  if (Array.isArray(obj)) {
    for (const item of obj) {
      const result:any = findByKey(item, key, value);
      if (result) return result;
    }
  } else if (typeof obj === "object" && obj !== null) {
    if (obj[key] === value) return obj;

    for (const k in obj) {
      const result:any = findByKey(obj[k], key, value);
      if (result) return result;
    }
  }
  return null;
};


function findParentKey(obj: any, key: string, value: any, parentKey: string | null = null): string | null {
  if (Array.isArray(obj)) {
    for (const item of obj) {
      const result = findParentKey(item, key, value, parentKey);
      if (result) return result;
    }
  } else if (typeof obj === "object" && obj !== null) {

    if (obj[key] === value) {
      return parentKey;
    }

    for (const k in obj) {
      const result = findParentKey(obj[k], key, value, k);
      if (result) return result;
    }
  }
  return null;
}

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

function getAttr(node: any, name: string) {
  return node?.[`@_${name}`];
}

function getType(node: any): string | undefined {
  const type = getAttr(node, 'type');
  return type?.split(':').pop();
}

function getDescription(node: any): string | undefined {
  let description = node.annotation?.appinfo?.description;
  if (typeof description !== 'string') {
    return undefined;
  }
  const text = description.replace(/\s+/g, ' ').trim();

  return text || undefined;
}

const XSD_TYPE_MAP: Record<string, FormControlSchema['type']> = {
string: 'string',
  normalizedString: 'string',
  token: 'string',
  language: 'string',
  Name: 'string',
  NCName: 'string',
  NMTOKEN: 'string',
  NMTOKENS: 'string',
  ID: 'string',
  IDREF: 'string',
  IDREFS: 'string',
  ENTITY: 'string',
  ENTITIES: 'string',
  boolean: 'string',

  byte: 'number',
  short: 'number',
  int: 'number',
  integer: 'number',
  long: 'number',
  negativeInteger: 'number',
  nonNegativeInteger: 'number',
  positiveInteger: 'number',
  nonPositiveInteger: 'number',
  unsignedByte: 'number',
  unsignedShort: 'number',
  unsignedInt: 'number',
  unsignedLong: 'number',
  decimal: 'number',
  float: 'number',
  double: 'number',

  date: 'date',
  dateTime: 'string',
  time: 'string',
  duration: 'string',
  gYear: 'string',
  gYearMonth: 'string',
  gMonth: 'string',
  gMonthDay: 'string',
  gDay: 'string'
};

function mapPrimitive(type?: string): FormControlSchema {
  const xsdType = type ?? 'string';
  const mapped = XSD_TYPE_MAP[xsdType] || 'string';
  
  switch (mapped) {
    case 'number':
      return {
        type: 'number',
        xsdType: xsdType,
        ui: {
          widget: 'number'
        }
      };

    case 'date':
      return {
        type: 'date',
        xsdType: xsdType,
        ui: {
          widget: 'date'
        }
      };

    default:
      return {
        type: 'string',
        xsdType: xsdType,
        ui: {
          widget: 'text'
        }
      };
  }
}



function getWidget(node: any): NonNullable<FormControlSchema['ui']>['widget'] | undefined {
  const value = node?.annotation?.appinfo?.type;

  if (typeof value !== 'string') {
    return undefined;
  }

  const widget = value.trim().toLowerCase();

  const supportedWidgets: NonNullable<FormControlSchema['ui']>['widget'][] = [
    'date',
    'select',
    'radio',
    'checkbox',
    'number',
    'range',
    'text',
    'textarea',
    'password',
    'email'
  ];

  if (supportedWidgets.includes(widget as NonNullable<FormControlSchema['ui']>['widget'])) {
    return widget as NonNullable<FormControlSchema['ui']>['widget'];
  }

  return undefined;
}

function isCompatibleWidget(schema: FormControlSchema, widget: NonNullable<FormControlSchema['ui']>['widget']): boolean {
  const hasEnumeration = schema.options !== undefined;
  const xsdType = schema.xsdType ?? schema.type;
  const category =
    XSD_TYPE_MAP[xsdType] ??
    (
      xsdType === 'string' ||
      xsdType === 'number' ||
      xsdType === 'date'
        ? xsdType
        : undefined
    );

  // These widgets are allowed for every XSD type.
  if (widget === 'text' || widget === 'password') {
    return true;
  }

  // Enumeration types can use select, radio, or checkbox.
  if (
    hasEnumeration &&
    (widget === 'select' ||
      widget === 'radio' ||
      widget === 'checkbox')
  ) {
    return true;
  }

  switch (category) {
    case 'date':
      return widget === 'date';

    case 'string':
      return (
        widget === 'number' ||
        widget === 'textarea' ||
        widget === 'email'
      );

    case 'number':
      return (
        widget === 'number' ||
        widget === 'range' ||
        widget === 'textarea'
      );

    default:
      // Other XSD types only support text, textarea, and password.
      return widget === 'textarea';
  }
}

function applyWidget(schema: FormControlSchema, widget: NonNullable<FormControlSchema['ui']>['widget']): FormControlSchema {
  if (isCompatibleWidget(schema, widget)) {
    schema.ui = {
      ...schema.ui,
      widget
    };
  }

  return schema;
}

function getWidgetProperties(node: any): NonNullable<FormControlSchema['ui']> {
  const ui: NonNullable<FormControlSchema['ui']> = {};
  const appinfo = node?.annotation?.appinfo;

  const textProperties = [
    'placeholder',
    'pattern',
    'value'
  ] as const;

  for (const property of textProperties) {

    const textValue=appinfo?.[property];
    if (textValue !== undefined && textValue !== null) {
      ui[property]= String(textValue).trim()
    }
  }

  const numberProperties = [
    'max',
    'maxlength',
    'min',
    'minlength',
    'step',
    'size',
    'rows',
    'cols'
  ] as const;

  for (const property of numberProperties) {
    const numberValue = appinfo?.[property];

    if (numberValue !== undefined && numberValue !== null && String(numberValue).trim() !== '') {
      let number= Number(numberValue);
      if(Number.isFinite(number)){
        ui[property] = number;
      }
    }
  }

  return ui;
}

function getOccurs(node: any) {
  return {
    min: Number(getAttr(node, 'minOccurs') ?? 1),
    max: getAttr(node, 'maxOccurs') === 'unbounded'
      ? Infinity
      : Number(getAttr(node, 'maxOccurs') ?? 1)
  };
}

function isPrimitiveType(type?: string): boolean {
  return type != null && type in XSD_TYPE_MAP;
}

function asArray<T>(value: T | T[] | undefined): T[] {
  if (value === undefined) {
    return [];
  }

  if (Array.isArray(value)) {
    return value;
  }

  return [value];
}

function parseXsd(xsd: any): FormSchema {
  const root = xsd.schema?.element[0];
  return parseElement(xsd,root);
};

function parseElement(xsd: any, node: any):FormSchema{
  const originalNode = node;
  const occurs = getOccurs(node);
  let schema: FormSchema = { type: 'string' };

  // reference handling
  let ref =getAttr(node,'ref');
  if(ref){
    const refName = ref.split(':').pop(); 
    const element = findByKey(xsd, '@_name', refName);

    if (element) {
      node = element;
    }
  }
  const name = getAttr(node, 'name');


  if (node.complexType) {
    schema = parseComplexType(xsd,node.complexType);
  } else if (node.simpleType) {
    schema = parseSimpleType(xsd,node.simpleType);
  } else {
    const type = getType(node);
    if (type){
      if(isPrimitiveType(type)){
        schema = mapPrimitive(type);
      } else{
        const typeDef = findByKey(xsd, '@_name', type);
        const parentKey = findParentKey(xsd, '@_name', type);
        if (typeDef) {       
          if(parentKey == "complexType"){
            schema = parseComplexType(xsd,typeDef);
          }
          if(parentKey == "simpleType"){
            schema = parseSimpleType(xsd,typeDef);
          }

        }

      }
    }

  }

  // Apply required
  schema.required = occurs.min !== 0;

  // Get name
  if (name) {
  schema.name = name;
  }

  //Get description
  const description = getDescription(node);

  if (description) {
    schema.description = description;
  }

  //Get widget
  const requestedWidget =
    getWidget(originalNode) ?? getWidget(node);

  if (requestedWidget && schema.type !== 'group') {
    applyWidget(schema, requestedWidget);
  }

  //Get widget properties
  let widgetProperties: NonNullable<FormControlSchema['ui']> = {};;
  if (schema.type !== 'group') {
    widgetProperties = {
    ...getWidgetProperties(node),
    ...getWidgetProperties(originalNode)
  };

    schema.ui = {
      ...schema.ui,
      ...widgetProperties
    };
  }

  if (schema.type !== 'group') {
    schema.validators = {
      ...schema.validators,
      ...(widgetProperties.min !== undefined && {
        min: widgetProperties.min
      }),
      ...(widgetProperties.max !== undefined && {
        max: widgetProperties.max
      }),
      ...(widgetProperties.minlength !== undefined && {
        minLength: widgetProperties.minlength
      }),
      ...(widgetProperties.maxlength !== undefined && {
        maxLength: widgetProperties.maxlength
      }),
      ...(widgetProperties.pattern !== undefined && {
        pattern: widgetProperties.pattern
      })
    };
  };
  // Handle arrays
  if (occurs.max > 1) {
    return {
      type: 'array',
      name,
      item: schema,
      minItems: occurs.min,
      maxItems: occurs.max === Infinity ? undefined : occurs.max
    };
  }

  return schema;

}

function parseComplexType(xsd: any, node: any): FormGroupSchema {
  const controls: Record<string, FormSchema> = {};
  const attributes: Record<string, FormControlSchema> = {};

  // ---- children ----

  const container = node.sequence || node.all || node.choice;
  const elements = asArray(container?.element);


  elements.forEach(element => {
    let name = getAttr(element, 'name');

    if (!name) {
      const ref = getAttr(element, 'ref');
      name = ref?.split(':').pop(); // extract actual name
    }

    controls[name] = parseElement(xsd, element);
  });
  

  // ---- attributes ----
  if (node.attribute) {
    const attrs = asArray(node.attribute);

    attrs.forEach(attr => {
      const name = getAttr(attr, 'name');

      attributes[name] = {
        ...mapPrimitive(getType(attr)),
        name,
        required: getAttr(attr, 'use') === 'required'
      };
    });
  }

  return {
    type: 'group',
    controls,
    attributes: Object.keys(attributes).length ? attributes : undefined,
  };
}


function parseSimpleType(xsd: any, node: any): FormControlSchema {

  // Handle union as string
  if (node.union) {
    return {
      type: 'string',
      xsdType: 'string',
      ui: {
        widget: 'text'
      }
    };
  }

  // Handle list
  const outerRestriction = node.restriction;

  const listNode =
    node.list ??
    outerRestriction?.simpleType?.list;

  if (listNode) {
    // Item type declared as an attribute
    const itemTypeAttribute = getAttr(listNode, 'itemType')
      ?.split(':')
      .pop();

    // Inline item type restrictions
    const inlineSimpleType = listNode.simpleType;
    const itemRestriction = inlineSimpleType?.restriction;

    const itemType =
      itemTypeAttribute ??
      getAttr(itemRestriction, 'base')?.split(':').pop() ??
      'string';

    const listSchema: FormControlSchema = {
      type: 'string',
      xsdType: 'list',
      listItemType: itemType,
      ui: { widget: 'text' }
    };

    // Restrictions on the number of list items
    if (outerRestriction?.length) {
      listSchema.listLength = Number(
        getAttr(outerRestriction.length, 'value')
      );
    }

    if (outerRestriction?.minLength) {
      listSchema.listMinItems = Number(
        getAttr(outerRestriction.minLength, 'value')
      );
    }

    if (outerRestriction?.maxLength) {
      listSchema.listMaxItems = Number(
        getAttr(outerRestriction.maxLength, 'value')
      );
    }

    // Restrictions on each individual item
    const itemValidators:
      NonNullable<FormControlSchema['listItemValidators']> = {};

    if (itemRestriction?.minInclusive) {
      itemValidators.min = Number(
        getAttr(itemRestriction.minInclusive, 'value')
      );
    }

    if (itemRestriction?.maxInclusive) {
      itemValidators.max = Number(
        getAttr(itemRestriction.maxInclusive, 'value')
      );
    }

    if (itemRestriction?.minLength) {
      itemValidators.minLength = Number(
        getAttr(itemRestriction.minLength, 'value')
      );
    }

    if (itemRestriction?.maxLength) {
      itemValidators.maxLength = Number(
        getAttr(itemRestriction.maxLength, 'value')
      );
    }

    if (itemRestriction?.pattern) {
      itemValidators.pattern = getAttr(
        itemRestriction.pattern,
        'value'
      );
    }

    if (itemRestriction?.enumeration) {
      listSchema.listItemOptions = asArray(
        itemRestriction.enumeration
      ).map(e => getAttr(e, 'value'));
    }

    listSchema.listItemValidators = itemValidators;

    return listSchema;
  }



  //Handle restrictions
  const restriction = node.restriction;

  const baseType = restriction?.['@_base']
    ? restriction['@_base'].split(':').pop()
    : undefined;

  const schema = mapPrimitive(baseType);

  //  Enumeration 
  if (restriction?.enumeration) {
    schema.options = asArray(restriction.enumeration)
      .map(e => getAttr(e, 'value'));

    schema.ui = {
      ...schema.ui,
      widget: 'select'
    };
  }

  // Validators 
  if (restriction?.minLength) {
    schema.validators ??= {};
    schema.validators.minLength =
      Number(getAttr(restriction.minLength, 'value'));
  }

  if (restriction?.maxLength) {
    schema.validators ??= {};
    schema.validators.maxLength =
      Number(getAttr(restriction.maxLength, 'value'));
  }

  if (restriction?.pattern) {
    schema.validators ??= {};
    schema.validators.pattern =
      getAttr(restriction.pattern, 'value');
  }

  if (restriction?.minInclusive) {
    schema.validators ??= {};
    schema.validators.min =
      Number(getAttr(restriction.minInclusive, 'value'));
  }

  if (restriction?.maxInclusive) {
    schema.validators ??= {};
    schema.validators.max =
      Number(getAttr(restriction.maxInclusive, 'value'));
  }


  // Uniqe widget choice
  const requestedWidget = getWidget(node);

  if (requestedWidget) {
    applyWidget(schema, requestedWidget);
  }

  return schema;
}



//Build form control

function buildForm(schema: FormSchema): AbstractControl {
  switch (schema.type) {
    case 'group':
      return buildGroup(schema);
    case 'array':
      return buildArray(schema);
    default:
      return buildControl(schema);
  }
};

function buildControl(schema: FormControlSchema): FormControl {
  const validators = mapValidators(schema);

  const initialValue =
    schema.defaultValue ??
    schema.ui?.value ??
    null;


  return new FormControl(
    initialValue,
    validators
  );
};

function buildGroup(schema: FormGroupSchema): FormGroup {
  const group: Record<string, AbstractControl> = {};

  // controls
  for (const key in schema.controls) {
    group[key] = buildForm(schema.controls[key]);
  }

  // attributes (optional)
  if (schema.attributes) {
    for (const key in schema.attributes) {
      group[`@${key}`] = buildForm(schema.attributes[key]);
    }
  }

  return new FormGroup(group);
};

function buildArray(schema: FormArraySchema): FormArray {
  const arr = new FormArray<AbstractControl>([]);

  const count = schema.minItems ?? 0;

  for (let i = 0; i < count; i++) {
    arr.push(buildForm(schema.item));
  }

  return arr;
}

function mapValidators(schema: FormControlSchema) {
  const v = schema.validators;
  const validators = [];

  if (schema.required) {
    validators.push(Validators.required);
  }

  if (v){

    if (v.min !== undefined) {
      validators.push(Validators.min(v.min));
    }

    if (v.max !== undefined) {
      validators.push(Validators.max(v.max));
    }

    if (v.minLength !== undefined) {
      validators.push(Validators.minLength(v.minLength));
    }

    if (v.maxLength !== undefined) {
      validators.push(Validators.maxLength(v.maxLength));
    }

    if (v.pattern) {
      validators.push(Validators.pattern(v.pattern));
    }
  }
  // validate each item in a list
  if (schema.listItemType) {
    validators.push((control: AbstractControl) => {
      const value = control.value;

      if (value == null || String(value).trim() === '') {
        return null;
      }

      const items = String(value).trim().split(/\s+/);

      // Exact number of list items
      if (
        schema.listLength !== undefined &&
        items.length !== schema.listLength
      ) {
        return {
          listLength: {
            requiredLength: schema.listLength,
            actualLength: items.length
          }
        };
      }

      // Minimum number of list items
      if (
        schema.listMinItems !== undefined &&
        items.length < schema.listMinItems
      ) {
        return {
          listMinItems: {
            requiredLength: schema.listMinItems,
            actualLength: items.length
          }
        };
      }

      // Maximum number of list items
      if (
        schema.listMaxItems !== undefined &&
        items.length > schema.listMaxItems
      ) {
        return {
          listMaxItems: {
            requiredLength: schema.listMaxItems,
            actualLength: items.length
          }
        };
      }

      const invalidItems = items.filter(item => {
          if (!isValidXsdValue(item, schema.listItemType!)) {
            return true;
          }

          if (schema.listItemOptions && !schema.listItemOptions.includes(item)) {
            return true;
          }

          const itemValidators = schema.listItemValidators;

          if (itemValidators) {
            if (itemValidators.min !== undefined && Number(item) < itemValidators.min) {
              return true;
            }

            if (itemValidators.max !== undefined && Number(item) > itemValidators.max) {
              return true;
            }

            if (itemValidators.minLength !== undefined && item.length < itemValidators.minLength) {
              return true;
            }

            if (itemValidators.maxLength !== undefined && item.length > itemValidators.maxLength) {
              return true;
            }

            if (itemValidators.pattern && !new RegExp(itemValidators.pattern).test(item)) {
              return true;
            }
          }

          return false;

        }
      );

      return invalidItems.length > 0
        ? { invalidListItems: invalidItems }
        : null;
    });
  }

  // validate non list value against XSD built-in type
  if (schema.xsdType && schema.xsdType !== 'list') {
    validators.push((control: AbstractControl) => {
      const value = control.value;

      // validators.required handles empty values
      if (value == null || String(value) === '') {
        return null;
      }

      return isValidXsdValue(String(value), schema.xsdType!)
        ? null
        : {
            invalidXsdType: {
              type: schema.xsdType,
              actualValue: value
            }
          };
    });
  }

  return validators;
}


function isValidXsdValue(value: string, xsdType: string): boolean {
  switch (xsdType) {
    // String types
    case 'string':
    case 'normalizedString':
    case 'token':
    case 'language':
    case 'Name':
    case 'NCName':
    case 'NMTOKEN':
    case 'NMTOKENS':
    case 'ID':
    case 'IDREF':
    case 'IDREFS':
    case 'ENTITY':
    case 'ENTITIES':
      return true;

    // Boolean
    case 'boolean':
      return ['true', 'false', '0', '1'].includes(value);

    // Number types
    case 'byte':
      return isIntegerInRange(value, -128n, 127n);

    case 'short':
      return isIntegerInRange(value, -32768n, 32767n);

    case 'int':
      return isIntegerInRange(value, -2147483648n, 2147483647n);

    case 'long':
      return isIntegerInRange(
        value, -9223372036854775808n, 9223372036854775807n
      );

    case 'unsignedByte':
      return isIntegerInRange(value, 0n, 255n);

    case 'unsignedShort':
      return isIntegerInRange(value, 0n, 65535n);

    case 'unsignedInt':
      return isIntegerInRange(value, 0n, 4294967295n);

    case 'unsignedLong':
      return isIntegerInRange(value, 0n, 18446744073709551615n);

    case 'integer':
      return /^[+-]?\d+$/.test(value);

    case 'positiveInteger':
      return isIntegerInRange(value, 1n);

    case 'negativeInteger':
      return isIntegerInRange(value, undefined, -1n);

    case 'nonNegativeInteger':
      return isIntegerInRange(value, 0n);

    case 'nonPositiveInteger':
      return isIntegerInRange(value, undefined, 0n);

    // Decimal and floating-point types
    case 'decimal':
      return /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(value);

    case 'float':
    case 'double':
      return (
        /^[+-]?(?:(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?|INF)$/.test(value) ||
        ['INF','+INF', '-INF', 'NaN'].includes(value)
      );

    // Date and time types
    case 'date':
      return isValidXsdDate(value);

    case 'dateTime':
      return /^-?\d{4,}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})?$/.test(value);

    case 'time':
      return /^\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})?$/.test(value);

    case 'gYear':
      return /^-?\d{4,}(?:Z|[+-]\d{2}:\d{2})?$/.test(value);
   
    case 'gYearMonth':
      return /^-?\d{4,}-(?:0[1-9]|1[0-2])(?:Z|[+-]\d{2}:\d{2})?$/.test(value);

    case 'gMonth':
      return /^(?:--)?(?:0[1-9]|1[0-2])(?:Z|[+-]\d{2}:\d{2})?$/.test(value);

    case 'gMonthDay':
      return /^(?:--)?(?:02-(?:0[1-9]|1\d|2[0-9])|(?:04|06|09|11)-(?:0[1-9]|[12]\d|30)|(?:01|03|05|07|08|10|12)-(?:0[1-9]|[12]\d|3[01]))(?:Z|[+-]\d{2}:\d{2})?$/.test(value);

    case 'gDay':
      return /^(?:---)?(?:0[1-9]|[12]\d|3[01])(?:Z|[+-]\d{2}:\d{2})?$/.test(value);

    case 'duration':
      return /^-?P(?=\d|T\d)(?:\d+Y)?(?:\d+M)?(?:\d+D)?(?:T(?:\d+H)?(?:\d+M)?(?:\d+(?:\.\d+)?S)?)?$/.test(value);

    default:
      // Unknown
      return true;
  }
}

function isIntegerInRange(value: string, min?: bigint,max?: bigint): boolean {
  //Is an int
  if (!/^[+-]?\d+$/.test(value)) {
    return false;
  }

  const number = BigInt(value);

  return (
    (min === undefined || number >= min) &&
    (max === undefined || number <= max)
  );
}

function isValidXsdDate(value: string): boolean {
  const match = /^(-?\d{4,})-(\d{2})-(\d{2})(?:Z|[+-]\d{2}:\d{2})?$/.exec(value);

  if (!match) {
    return false;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  if (month < 1 || month > 12 || day < 1) {
    return false;
  }

  const leapYear =
    year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);

  const daysInMonth = [
    31, leapYear ? 29 : 28, 31, 30, 31, 30,
    31, 31, 30, 31, 30, 31
  ];

  return day <= daysInMonth[month - 1];
}

// Translate form to xml based on xml schema

//Create indention for depth
function getIndent(level: number): string {
  return '  '.repeat(level);
}

//Remove symbols from answers that have meaning in xml
function removeXmlSymbols(value: any): string {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

//Checks if an answers is empty
function isEmptyValue(value: any): boolean {
  return value === undefined || value === null || value === '';
}

//Converts answer into text
function serializeControl(schema: FormControlSchema, value: any): string {
  if (isEmptyValue(value)) {
    return '';
  }
  value= String(value);
  switch (schema.xsdType) {
    case 'gMonth':
      return value.startsWith('--') ? removeXmlSymbols(value) : removeXmlSymbols( `--${value}`);

    case 'gMonthDay':
      return value.startsWith('--') ? removeXmlSymbols(value) : removeXmlSymbols(`--${value}`);

    case 'gDay':
      return value.startsWith('---') ? removeXmlSymbols(value) :removeXmlSymbols( `---${value}`);

    default:
      return removeXmlSymbols(value);
  }

}

//Checks for the attributes belongting to a group
function serializeAttributes(schema: FormGroupSchema, value: any): string {
  if (!schema.attributes) {
    return '';
  }

  let result = '';

  for (const [name, attributeSchema] of Object.entries(schema.attributes)) {
    const attributeValue = value?.[`@${name}`];

    // Optional empty attributes are omitted.
    if (isEmptyValue(attributeValue) && !attributeSchema.required) {
      continue;
    }

    // Required attributes are still written, even if empty.
    result += ` ${name}="${removeXmlSymbols(attributeValue ?? '')}"`;
  }

  return result;
}

//Checks for the child elements belonging to a group
function serializeChildren(schema: FormGroupSchema, value: any, indent: number): string {
  let result = '';

  for (const [name, childSchema] of Object.entries(schema.controls)) {
    const childValue = value?.[name];

    const xml = serializeElement(
      name,
      childSchema,
      childValue,
      indent
    );

    result += xml;
  }

  return result;
}


function serializeElement(name: string,schema: FormSchema,value: any, indent: number): string {

  const indentation = getIndent(indent);

  // ARRAY
  if (schema.type === 'array') {
    if (!Array.isArray(value)) {
      return '';
    }

    let result = '';

    for (const item of value) {
      result += serializeElement(
        name,
        schema.item,
        item,
        indent
      );
    }

    return result;
  }


  // GROUP
  if (schema.type === 'group') {
    const attributes = serializeAttributes(
      schema,
      value
    );

    const children = serializeChildren(
      schema,
      value,
      indent+1
    );

    // If an optional group has nothing inside it omits the entire element
    if (!schema.required && !attributes && !children) {
      return '';
    }

    // If it has no children
    if (!children) {
      return `${indentation}<${name}${attributes}></${name}>\n`;
    }

    return `${indentation}<${name}${attributes}>\n` + children + `${indentation}</${name}>\n`;
  }


  // CONTROL
  const content = serializeControl(
    schema,
    value
  );

  // If an optional element has nothing inside it omits the entire element
  if (isEmptyValue(value) && !schema.required) {
    return '';
  }

  // Empty required element
  return `${indentation}<${name}>${content}</${name}>\n`;
}

//Generate xml string
export function generateXml(schema: FormSchema, value: any): string {

  if (schema.type !== 'group') {
    throw new Error('The root schema must be a group.');
  }

  if (!schema.name) {
    throw new Error('The root schema has no name.');
  }

  const attributes = serializeAttributes(schema,value);

  const children = serializeChildren(schema,value,1);

  return (
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    `<${schema.name}${attributes}>\n` + children + `</${schema.name}>`
  );
}
