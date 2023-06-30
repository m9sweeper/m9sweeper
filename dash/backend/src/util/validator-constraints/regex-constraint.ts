import {ValidatorConstraint, ValidatorConstraintInterface} from 'class-validator';

@ValidatorConstraint({ name: 'regex', async: false})
export class RegexConstraint implements ValidatorConstraintInterface {
  validate(value: string): boolean {
    try {
      new RegExp(value);
      return true;
    } catch (e) {
      // the RegExp constructor will throw an error is the value is an invalid regexp
      return false;
    }
  }

  defaultMessage(): string {
    return '$value is not a valid regular expression.';
  }
}