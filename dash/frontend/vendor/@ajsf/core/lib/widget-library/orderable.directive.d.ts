import { ElementRef, NgZone, OnInit } from '@angular/core';
import { JsonSchemaFormService } from '../json-schema-form.service';
import * as i0 from "@angular/core";
/**
 * OrderableDirective
 *
 * Enables array elements to be reordered by dragging and dropping.
 *
 * Only works for arrays that have at least two elements.
 *
 * Also detects arrays-within-arrays, and correctly moves either
 * the child array element or the parent array element,
 * depending on the drop targert.
 *
 * Listeners for movable element being dragged:
 * - dragstart: add 'dragging' class to element, set effectAllowed = 'move'
 * - dragover: set dropEffect = 'move'
 * - dragend: remove 'dragging' class from element
 *
 * Listeners for stationary items being dragged over:
 * - dragenter: add 'drag-target-...' classes to element
 * - dragleave: remove 'drag-target-...' classes from element
 * - drop: remove 'drag-target-...' classes from element, move dropped array item
 */
export declare class OrderableDirective implements OnInit {
    private elementRef;
    private jsf;
    private ngZone;
    arrayLayoutIndex: string;
    element: any;
    overParentElement: boolean;
    overChildElement: boolean;
    orderable: boolean;
    layoutNode: any;
    layoutIndex: number[];
    dataIndex: number[];
    constructor(elementRef: ElementRef, jsf: JsonSchemaFormService, ngZone: NgZone);
    ngOnInit(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<OrderableDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<OrderableDirective, "[orderable]", never, { "orderable": "orderable"; "layoutNode": "layoutNode"; "layoutIndex": "layoutIndex"; "dataIndex": "dataIndex"; }, {}, never, never, false>;
}
