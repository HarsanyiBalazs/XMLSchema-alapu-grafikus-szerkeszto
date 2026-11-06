import { Injectable } from '@angular/core';
import { FormGroup, FormControl, FormArray, Validators, AbstractControl, ReactiveFormsModule } from '@angular/forms';
import { FormSchema, FormControlSchema, FormGroupSchema, FormArraySchema } from '../models/formSchema.model';
@Injectable({
  providedIn: 'root',
})
export class FormGenerator {

  //First section responsible for helper function for parsing the xsd object into an object thats easier to work with

  findByKey(obj: any, key: string, value: string) {
    if (Array.isArray(obj)) {
      for (const item of obj) {
        const result: any = this.findByKey(item, key, value);
        if (result) return result;
      }
    } else if (typeof obj === "object" && obj !== null) {
      if (obj[key] === value) return obj;

      for (const k in obj) {
        const result: any = this.findByKey(obj[k], key, value);
        if (result) return result;
      }
    }
    return null;
  };


  findParentKey(obj: any, key: string, value: any, parentKey: string | null = null): string | null {
    if (Array.isArray(obj)) {
      for (const item of obj) {
        const result = this.findParentKey(item, key, value, parentKey);
        if (result) return result;
      }
    } else if (typeof obj === "object" && obj !== null) {

      if (obj[key] === value) {
        return parentKey;
      }

      for (const k in obj) {
        const result = this.findParentKey(obj[k], key, value, k);
        if (result) return result;
      }
    }
    return null;
  }

  getAttr(node: any, name: string) {
    return node?.[`@_${name}`];
  }

  getType(node: any): string | undefined {
    const type = this.getAttr(node, 'type');
    return type?.split(':').pop();
  }

  getDescription(node: any): string | undefined {
    let description = node.annotation?.appinfo?.description;
    if (typeof description !== 'string') {
      return undefined;
    }
    const text = description.replace(/\s+/g, ' ').trim();

    return text || undefined;
  }

  XSD_TYPE_MAP: Record<string, FormControlSchema['type']> = {
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

  mapPrimitive(type?: string): FormControlSchema {
    const xsdType = type ?? 'string';
    const mapped = this.XSD_TYPE_MAP[xsdType] || 'string';

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



  getWidget(node: any): NonNullable<FormControlSchema['ui']>['widget'] | undefined {
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

  isCompatibleWidget(schema: FormControlSchema, widget: NonNullable<FormControlSchema['ui']>['widget']): boolean {
    const hasEnumeration = schema.options !== undefined;
    const xsdType = schema.xsdType ?? schema.type;
    const category =
      this.XSD_TYPE_MAP[xsdType] ??
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

  applyWidget(schema: FormControlSchema, widget: NonNullable<FormControlSchema['ui']>['widget']): FormControlSchema {
    if (this.isCompatibleWidget(schema, widget)) {
      schema.ui = {
        ...schema.ui,
        widget
      };
    }

    return schema;
  }

  getWidgetProperties(node: any): NonNullable<FormControlSchema['ui']> {
    const ui: NonNullable<FormControlSchema['ui']> = {};
    const appinfo = node?.annotation?.appinfo;

    const textProperties = [
      'placeholder',
      'pattern',
      'value'
    ] as const;

    for (const property of textProperties) {

      const textValue = appinfo?.[property];
      if (textValue !== undefined && textValue !== null) {
        ui[property] = String(textValue).trim()
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
        let number = Number(numberValue);
        if (Number.isFinite(number)) {
          ui[property] = number;
        }
      }
    }

    return ui;
  }

  getOccurs(node: any) {
    return {
      min: Number(this.getAttr(node, 'minOccurs') ?? 1),
      max: this.getAttr(node, 'maxOccurs') === 'unbounded'
        ? Infinity
        : Number(this.getAttr(node, 'maxOccurs') ?? 1)
    };
  }

  isPrimitiveType(type?: string): boolean {
    return type != null && type in this.XSD_TYPE_MAP;
  }

  asArray<T>(value: T | T[] | undefined): T[] {
    if (value === undefined) {
      return [];
    }

    if (Array.isArray(value)) {
      return value;
    }

    return [value];
  }





  //Second section actually parsing the xsd object into a more readable object

  parseXsd(xsd: any): FormSchema {
    const root = xsd.schema?.element[0];
    return this.parseElement(xsd, root);
  };

  parseElement(xsd: any, node: any): FormSchema {
    const originalNode = node;
    const occurs = this.getOccurs(node);
    let schema: FormSchema = { type: 'string' };

    // reference handling
    let ref = this.getAttr(node, 'ref');
    if (ref) {
      const refName = ref.split(':').pop();
      const element = this.findByKey(xsd, '@_name', refName);

      if (element) {
        node = element;
      }
    }
    const name = this.getAttr(node, 'name');


    if (node.complexType) {
      schema = this.parseComplexType(xsd, node.complexType);
    } else if (node.simpleType) {
      schema = this.parseSimpleType(xsd, node.simpleType);
    } else {
      const type = this.getType(node);
      if (type) {
        if (this.isPrimitiveType(type)) {
          schema = this.mapPrimitive(type);
        } else {
          const typeDef = this.findByKey(xsd, '@_name', type);
          const parentKey = this.findParentKey(xsd, '@_name', type);
          if (typeDef) {
            if (parentKey == "complexType") {
              schema = this.parseComplexType(xsd, typeDef);
            }
            if (parentKey == "simpleType") {
              schema = this.parseSimpleType(xsd, typeDef);
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
    const description = this.getDescription(node);

    if (description) {
      schema.description = description;
    }

    //Get widget
    const requestedWidget =
      this.getWidget(originalNode) ?? this.getWidget(node);

    if (requestedWidget && schema.type !== 'group') {
      this.applyWidget(schema, requestedWidget);
    }

    //Get widget properties
    let widgetProperties: NonNullable<FormControlSchema['ui']> = {};;
    if (schema.type !== 'group') {
      widgetProperties = {
        ...this.getWidgetProperties(node),
        ...this.getWidgetProperties(originalNode)
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

  parseComplexType(xsd: any, node: any): FormGroupSchema {
    const controls: Record<string, FormSchema> = {};
    const attributes: Record<string, FormControlSchema> = {};

    // ---- children ----

    const container = node.sequence || node.all || node.choice;
    const elements = this.asArray(container?.element);


    elements.forEach(element => {
      let name = this.getAttr(element, 'name');

      if (!name) {
        const ref = this.getAttr(element, 'ref');
        name = ref?.split(':').pop(); // extract actual name
      }

      controls[name] = this.parseElement(xsd, element);
    });


    // ---- attributes ----
    if (node.attribute) {
      const attrs = this.asArray(node.attribute);

      attrs.forEach(attr => {
        const name = this.getAttr(attr, 'name');

        attributes[name] = {
          ...this.mapPrimitive(this.getType(attr)),
          name,
          required: this.getAttr(attr, 'use') === 'required'
        };
      });
    }

    return {
      type: 'group',
      controls,
      attributes: Object.keys(attributes).length ? attributes : undefined,
    };
  }


  parseSimpleType(xsd: any, node: any): FormControlSchema {

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
      const itemTypeAttribute = this.getAttr(listNode, 'itemType')
        ?.split(':')
        .pop();

      // Inline item type restrictions
      const inlineSimpleType = listNode.simpleType;
      const itemRestriction = inlineSimpleType?.restriction;

      const itemType =
        itemTypeAttribute ??
        this.getAttr(itemRestriction, 'base')?.split(':').pop() ??
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
          this.getAttr(outerRestriction.length, 'value')
        );
      }

      if (outerRestriction?.minLength) {
        listSchema.listMinItems = Number(
          this.getAttr(outerRestriction.minLength, 'value')
        );
      }

      if (outerRestriction?.maxLength) {
        listSchema.listMaxItems = Number(
          this.getAttr(outerRestriction.maxLength, 'value')
        );
      }

      // Restrictions on each individual item
      const itemValidators:
        NonNullable<FormControlSchema['listItemValidators']> = {};

      if (itemRestriction?.minInclusive) {
        itemValidators.min = Number(
          this.getAttr(itemRestriction.minInclusive, 'value')
        );
      }

      if (itemRestriction?.maxInclusive) {
        itemValidators.max = Number(
          this.getAttr(itemRestriction.maxInclusive, 'value')
        );
      }

      if (itemRestriction?.minLength) {
        itemValidators.minLength = Number(
          this.getAttr(itemRestriction.minLength, 'value')
        );
      }

      if (itemRestriction?.maxLength) {
        itemValidators.maxLength = Number(
          this.getAttr(itemRestriction.maxLength, 'value')
        );
      }

      if (itemRestriction?.pattern) {
        itemValidators.pattern = this.getAttr(
          itemRestriction.pattern,
          'value'
        );
      }

      if (itemRestriction?.enumeration) {
        listSchema.listItemOptions = this.asArray(
          itemRestriction.enumeration
        ).map(e => this.getAttr(e, 'value'));
      }

      listSchema.listItemValidators = itemValidators;

      return listSchema;
    }



    //Handle restrictions
    const restriction = node.restriction;

    const baseType = restriction?.['@_base']
      ? restriction['@_base'].split(':').pop()
      : undefined;

    const schema = this.mapPrimitive(baseType);

    //  Enumeration 
    if (restriction?.enumeration) {
      schema.options = this.asArray(restriction.enumeration)
        .map(e => this.getAttr(e, 'value'));

      schema.ui = {
        ...schema.ui,
        widget: 'select'
      };
    }

    // Validators 
    if (restriction?.minLength) {
      schema.validators ??= {};
      schema.validators.minLength =
        Number(this.getAttr(restriction.minLength, 'value'));
    }

    if (restriction?.maxLength) {
      schema.validators ??= {};
      schema.validators.maxLength =
        Number(this.getAttr(restriction.maxLength, 'value'));
    }

    if (restriction?.pattern) {
      schema.validators ??= {};
      schema.validators.pattern =
        this.getAttr(restriction.pattern, 'value');
    }

    if (restriction?.minInclusive) {
      schema.validators ??= {};
      schema.validators.min =
        Number(this.getAttr(restriction.minInclusive, 'value'));
    }

    if (restriction?.maxInclusive) {
      schema.validators ??= {};
      schema.validators.max =
        Number(this.getAttr(restriction.maxInclusive, 'value'));
    }


    // Uniqe widget choice
    const requestedWidget = this.getWidget(node);

    if (requestedWidget) {
      this.applyWidget(schema, requestedWidget);
    }

    return schema;
  }



  //Build form control for form generation and validation

  //Build form control

  buildForm(schema: FormSchema): AbstractControl {
    switch (schema.type) {
      case 'group':
        return this.buildGroup(schema);
      case 'array':
        return this.buildArray(schema);
      default:
        return this.buildControl(schema);
    }
  };

  buildControl(schema: FormControlSchema): FormControl {
    const validators = this.mapValidators(schema);

    const initialValue =
      schema.defaultValue ??
      schema.ui?.value ??
      null;


    return new FormControl(
      initialValue,
      validators
    );
  };

  buildGroup(schema: FormGroupSchema): FormGroup {
    const group: Record<string, AbstractControl> = {};

    // controls
    for (const key in schema.controls) {
      group[key] = this.buildForm(schema.controls[key]);
    }

    // attributes (optional)
    if (schema.attributes) {
      for (const key in schema.attributes) {
        group[`@${key}`] = this.buildForm(schema.attributes[key]);
      }
    }

    return new FormGroup(group);
  };

  buildArray(schema: FormArraySchema): FormArray {
    const arr = new FormArray<AbstractControl>([]);

    const count = schema.minItems ?? 0;

    for (let i = 0; i < count; i++) {
      arr.push(this.buildForm(schema.item));
    }

    return arr;
  }

  mapValidators(schema: FormControlSchema) {
    const v = schema.validators;
    const validators = [];

    if (schema.required) {
      validators.push(Validators.required);
    }

    if (v) {

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
          if (!this.isValidXsdValue(item, schema.listItemType!)) {
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

        return this.isValidXsdValue(String(value), schema.xsdType!)
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


  isValidXsdValue(value: string, xsdType: string): boolean {
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
        return this.isIntegerInRange(value, -128n, 127n);

      case 'short':
        return this.isIntegerInRange(value, -32768n, 32767n);

      case 'int':
        return this.isIntegerInRange(value, -2147483648n, 2147483647n);

      case 'long':
        return this.isIntegerInRange(
          value, -9223372036854775808n, 9223372036854775807n
        );

      case 'unsignedByte':
        return this.isIntegerInRange(value, 0n, 255n);

      case 'unsignedShort':
        return this.isIntegerInRange(value, 0n, 65535n);

      case 'unsignedInt':
        return this.isIntegerInRange(value, 0n, 4294967295n);

      case 'unsignedLong':
        return this.isIntegerInRange(value, 0n, 18446744073709551615n);

      case 'integer':
        return /^[+-]?\d+$/.test(value);

      case 'positiveInteger':
        return this.isIntegerInRange(value, 1n);

      case 'negativeInteger':
        return this.isIntegerInRange(value, undefined, -1n);

      case 'nonNegativeInteger':
        return this.isIntegerInRange(value, 0n);

      case 'nonPositiveInteger':
        return this.isIntegerInRange(value, undefined, 0n);

      // Decimal and floating-point types
      case 'decimal':
        return /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(value);

      case 'float':
      case 'double':
        return (
          /^[+-]?(?:(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?|INF)$/.test(value) ||
          ['INF', '+INF', '-INF', 'NaN'].includes(value)
        );

      // Date and time types
      case 'date':
        return this.isValidXsdDate(value);

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

  isIntegerInRange(value: string, min?: bigint, max?: bigint): boolean {
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

  isValidXsdDate(value: string): boolean {
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




  // Turn form into an xml string

  getIndent(level: number): string {
    return '  '.repeat(level);
  }

  //Remove symbols from answers that have meaning in xml
  removeXmlSymbols(value: any): string {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  //Checks if an answers is empty
  isEmptyValue(value: any): boolean {
    return value === undefined || value === null || value === '';
  }

  //Converts answer into text
  serializeControl(schema: FormControlSchema, value: any): string {
    if (this.isEmptyValue(value)) {
      return '';
    }
    value = String(value);
    switch (schema.xsdType) {
      case 'gMonth':
        return value.startsWith('--') ? this.removeXmlSymbols(value) : this.removeXmlSymbols(`--${value}`);

      case 'gMonthDay':
        return value.startsWith('--') ? this.removeXmlSymbols(value) : this.removeXmlSymbols(`--${value}`);

      case 'gDay':
        return value.startsWith('---') ? this.removeXmlSymbols(value) : this.removeXmlSymbols(`---${value}`);

      default:
        return this.removeXmlSymbols(value);
    }

  }

  //Checks for the attributes belongting to a group
  serializeAttributes(schema: FormGroupSchema, value: any): string {
    if (!schema.attributes) {
      return '';
    }

    let result = '';

    for (const [name, attributeSchema] of Object.entries(schema.attributes)) {
      const attributeValue = value?.[`@${name}`];

      // Optional empty attributes are omitted.
      if (this.isEmptyValue(attributeValue) && !attributeSchema.required) {
        continue;
      }

      // Required attributes are still written, even if empty.
      result += ` ${name}="${this.removeXmlSymbols(attributeValue ?? '')}"`;
    }

    return result;
  }

  //Checks for the child elements belonging to a group
  serializeChildren(schema: FormGroupSchema, value: any, indent: number): string {
    let result = '';

    for (const [name, childSchema] of Object.entries(schema.controls)) {
      const childValue = value?.[name];

      const xml = this.serializeElement(
        name,
        childSchema,
        childValue,
        indent
      );

      result += xml;
    }

    return result;
  }


  serializeElement(name: string, schema: FormSchema, value: any, indent: number): string {

    const indentation = this.getIndent(indent);

    // ARRAY
    if (schema.type === 'array') {
      if (!Array.isArray(value)) {
        return '';
      }

      let result = '';

      for (const item of value) {
        result += this.serializeElement(
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
      const attributes = this.serializeAttributes(
        schema,
        value
      );

      const children = this.serializeChildren(
        schema,
        value,
        indent + 1
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
    const content = this.serializeControl(
      schema,
      value
    );

    // If an optional element has nothing inside it omits the entire element
    if (this.isEmptyValue(value) && !schema.required) {
      return '';
    }

    // Empty required element
    return `${indentation}<${name}>${content}</${name}>\n`;
  }

  //Generate xml string
  generateXml(schema: FormSchema, value: any): string {

    if (schema.type !== 'group') {
      throw new Error('The root schema must be a group.');
    }

    if (!schema.name) {
      throw new Error('The root schema has no name.');
    }

    const attributes = this.serializeAttributes(schema, value);

    const children = this.serializeChildren(schema, value, 1);

    return (
      '<?xml version="1.0" encoding="UTF-8"?>\n' +
      `<${schema.name}${attributes}>\n` + children + `</${schema.name}>`
    );
  }
}
