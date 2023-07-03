import { Pipe, PipeTransform } from '@angular/core';

/**
 * Printed the values of the array as a comma separated list.
 * Options:
 * key: Assumes the elements of the array are objects, and prints only the value in this key
 * elements: Will only display this many elements (takes from start of array)
 * */
@Pipe({
  name: 'arrayText'
})
export class ArrayTextPipe implements PipeTransform {

  transform(array: any[], options?: { key?: string, elements?: number}): unknown {
    if (options?.elements > 0) {
      array = array.slice(0, options?.elements);
    }
    return array
      .map((el) => options?.key ? el[options?.key] : el)
      .join(', ');
  }
}
