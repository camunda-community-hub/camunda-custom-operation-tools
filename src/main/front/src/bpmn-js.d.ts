/*
 * Copyright Camunda Services GmbH and/or licensed to Camunda Services GmbH
 * under one or more contributor license agreements. Licensed under a proprietary license.
 * See the License.txt file for more information. You may not use this file
 * except in compliance with the proprietary license.
 */

declare module 'bpmn-js/lib/util/ModelUtil' {
  export function is(element: BpmnElement, type: string): boolean;
}

declare module 'bpmn-moddle' {
  export type DiagramModel = {
    elementsById: {
      [id: string]: BusinessObject;
    };
  };

  class BpmnModdle {
    constructor();
    fromXML(xml: BpmnElement, definitions: string): Promise<DiagramModel>;
  }

  export = BpmnModdle;
}

declare module 'bpmn-js/lib/NavigatedViewer' {
  export type EventType = `bpmn:${
    | 'MessageEventDefinition'
    | 'ErrorEventDefinition'
    | 'TimerEventDefinition'
    | 'TerminateEventDefinition'
    | 'LinkEventDefinition'
    | 'EscalationEventDefinition'}`;

  export type FlowNodeType = `bpmn:${
    | 'StartEvent'
    | 'EndEvent'
    | 'IntermediateCatchEvent'
    | 'IntermediateThrowEvent'
    | 'EventBasedGateway'
    | 'ParallelGateway'
    | 'ExclusiveGateway'
    | 'InclusiveGateway'
    | 'SubProcess'
    | 'ServiceTask'
    | 'UserTask'
    | 'BusinessRuleTask'
    | 'ScriptTask'
    | 'ReceiveTask'
    | 'SendTask'
    | 'ManualTask'
    | 'CallActivity'
    | 'BoundaryEvent'}`;

  export type ElementType =
    | FlowNodeType
    | 'label'
    | `bpmn:${'Process' | 'SequenceFlow'}`;

  export type BusinessObject = {
    id: string;
    name: string;
    $type: ElementType;
    isInterrupting?: boolean;
    $parent?: BusinessObject;
    sourceRef?: BusinessObject;
    incoming?: BusinessObject[];
    flowElements?: BusinessObject[];
    loopCharacteristics?: {$type: string; isSequential: boolean};
    extensionElements?: {
      values: {
        $type: string;
        $children?: {
          $type: string;
          source: string;
          target: string;
        }[];
      }[];
    };
    eventDefinitions?: {$type: EventType}[];
    cancelActivity?: boolean;
    triggeredByEvent?: boolean;
    $instanceOf?: (type: string) => boolean;
  };

  export type BpmnElement = {
    id: string;
    type: ElementType;
    businessObject: BusinessObject;
    di: {set: Function};
    width: number;
    height: number;
    x: number;
    y: number;
  };

  export type Event = {
    element: BpmnElement;
    gfx: SVGElement;
    originalEvent: PointerEvent;
  };

  export type EventCallback = (
    event: string,
    callback: (event: Event) => void
  ) => void;

  export type OverlayPosition = {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
  };

  declare class NavigatedViewer {
    constructor({
      container,
      bpmnRenderer,
      additionalModules,
    }: {
      container: HTMLElement;
      bpmnRenderer: {[moduleName]: unknown};
      additionalModules: unknown[];
    });

    importXML: (xml: string) => Promise<{warnings: string[]}>;
    destroy: () => void;
    get(module: 'elementRegistry'): {
      get(elementId: BpmnElement['id']): BpmnElement;
      filter(callback: (element: BpmnElement) => boolean): BpmnElement[];
      getGraphics(element: BpmnElement): SVGGraphicsBpmnElement;
      getGraphics(elementId: BpmnElement['id']): SVGGraphicsElement;
    };
    get(module: 'canvas'): {
      removeMarker(elementId: BpmnElement['id'], className: string): void;
      addMarker(elementId: BpmnElement['id'], className: string): void;
      resized(): void;
      zoom(
        newScale: number | 'fit-viewport',
        center: 'auto' | {x: number; y: number} | null
      ): void;
    };
    get(module: 'graphicsFactory'): {
      update(type: string, element: BpmnElement, gfx: SVGGraphicsElement): void;
    };
    get(module: 'overlays'): {
      add(
        elementId: BpmnElement['id'],
        type: string,
        overlay: {
          html: HTMLElement;
          position: OverlayPosition;
          scale?: {min: number; max: number};
        }
      );
      clear(): void;
    };
    get(module: 'zoomScroll'): {
      stepZoom(step: number): void;
    };

    on: EventCallback;
    off: EventCallback;
  }

  export = NavigatedViewer;
}
