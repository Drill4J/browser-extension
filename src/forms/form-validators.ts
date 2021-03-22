/*
 * Copyright 2020 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { camelToSpaces, getNestedProperty } from '../utils';
import addressValidator from './validators/address';

type FormValidationResult = Record<string, string> | undefined;
export type FormValidator = <T extends Record<string, unknown>>(formValues: T) => FormValidationResult;

export function composeValidators(...validators: FormValidator[]): FormValidator {
  return (values) => Object.assign({}, ...validators.map((validator) => validator(values)));
}

export function required(fieldName: string, fieldAlias?: string): FormValidator {
  return (valitationItem) => {
    const value = getNestedProperty<string>(valitationItem, fieldName);
    return (!value || (typeof value === 'string' && !value.trim())
      ? toError(fieldName, `${fieldAlias || camelToSpaces(fieldName)} is required.`)
      : undefined);
  };
}

export function sizeLimit({
  name,
  alias,
  min = 3,
  max = 32,
}: {
  name: string;
  alias?: string;
  min?: number;
  max?: number;
}): FormValidator {
  return (valitationItem) => {
    const value = getNestedProperty<string>(valitationItem, name);
    return ((value && typeof value === 'string' && value.trim().length < min)
    || (value && typeof value === 'string' && value.trim().length > max)
      ? toError(name, `${alias
        || camelToSpaces(name)} size should be between ${min} and ${max} characters.`)
      : undefined);
  };
}

function toError(fieldName: string, error: string) {
  const field = fieldName.split('.');
  return field.reduceRight((acc, key, index) => (
    { [key]: index === field.length - 1 ? error : acc }
  ), {});
}

function createValidator(validator: (value: any) => void) {
  return (field: string, errorMessage: string): FormValidator => (data) => {
    const value = getNestedProperty<string>(data, field);
    try {
      validator(value);
      return undefined;
    } catch (e) {
      return toError(field, errorMessage || e.message);
    }
  };
}

export const validateAddress = createValidator(addressValidator);
