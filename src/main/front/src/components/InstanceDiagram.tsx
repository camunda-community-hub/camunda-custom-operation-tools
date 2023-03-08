import React, { useState, useEffect } from 'react';
import NavigatedViewer, {
  Event, BusinessObject
} from 'bpmn-js/lib/NavigatedViewer';
import ElementTemplatesIconsRenderer from '@bpmn-io/element-template-icon-renderer';
import { Table } from 'react-bootstrap';

type Params = {
  xml: string;
  history: any[];
  variables: any[];
  style: any
};

function InstanceDiagram(params: Params) {

  const [navigatedViewer, setNavigaterViewer] = useState<NavigatedViewer | null>(null);
  const diagramContainer = React.useRef<HTMLDivElement>(null);
  const [showInfo, setShowInfo] = useState<boolean>(false);
  const [currentFlowNode, setCurrentFlowNode] = useState<any | null>(null);
  let clickables: any[] = [];
 
  useEffect(() => {
    if (params.history) {
      for (let i = 0; i < params.history.length; i++) {
        clickables.push(params.history[i].flowNodeId);
      }
    }
    if (params.xml) {
      createViewer();
    }
  }, []);

  
  useEffect(() => {
    if (params.history && navigatedViewer) {
      for (let i = params.history.length - 1; i >= 0; i--) {
        if (params.history[i].state != "TERMINATED") {
          if (params.history[i].incident === true) {
            colorActivity(params.history[i].flowNodeId, "#CC0000");
          } else if (params.history[i].state === "ACTIVE") {
            colorActivity(params.history[i].flowNodeId, "#00CC00");
          } else {
            colorActivity(params.history[i].flowNodeId, "#6699CC");
          }
        }
      }
    }

  }, [navigatedViewer]);

  const createViewer = async () => {

    if (diagramContainer.current?.hasChildNodes()) {
      diagramContainer.current?.removeChild(diagramContainer.current.children[0]);
    }
    if (params.xml) {
      let viewer = new NavigatedViewer({
        container: diagramContainer.current!,
        bpmnRenderer: {
          height: 600,
          center: true,
          useMiniMap: true,
        },
        additionalModules: [ElementTemplatesIconsRenderer],
      });
      await viewer!.importXML(params.xml);

      viewer.on('element.click', displayInfoBox);
      viewer.on('canvas.viewbox.changing', () => {
        hideInfoBox();
      });
      setNavigaterViewer(viewer);
    }
  };

  const colorActivity = (id: string, color: string) => {
    const elementRegistry = navigatedViewer?.get('elementRegistry');
    const graphicsFactory = navigatedViewer?.get('graphicsFactory');
    const element = elementRegistry?.get(id);
    if (element?.di !== undefined) {
      element.di.set('stroke', color);

      const gfx = elementRegistry?.getGraphics(element);
      if (gfx !== undefined) {
        graphicsFactory?.update('connection', element, gfx);
      }
    }
  };

  const displayInfoBox = (event: Event) => {
    const flowNode = event.element;

    if (clickables.indexOf(flowNode.id) >= 0) {
      let clone: any = Object.assign({}, flowNode);
      clone.businessObject = flowNode.businessObject;
      clone.x = event.originalEvent.x;
      clone.y = event.originalEvent.y;
      for (let i = params.history.length - 1; i >= 0; i--) {
        if (params.history![i].flowNodeId == flowNode.id) {
          clone.instance = params.history![i];
        }
      }
      if (params.variables) {
        clone.variables = [];
        for (let i = 0; i < params.variables.length; i++) {
          if (params.variables[i].scopeKey == clone.instance.key) {
            clone.variables.push(params.variables[i]);
          }
        }
      }
      setCurrentFlowNode(clone);
      setShowInfo(true);
    } else {
      setShowInfo(false);
    }
    //console.log(isMultiInstance(flowNode.businessObject));

  };
  const hideInfoBox = () => {
    setShowInfo(false);
  }
  const isMultiInstance = (businessObject?: BusinessObject) => {
    return (
      businessObject?.loopCharacteristics?.$type ===
      'bpmn:MultiInstanceLoopCharacteristics'
    );
  }
  
  return (
    <>
      <div ref={diagramContainer} style={params.style}>
      </div>
      {currentFlowNode ?
        <div className={showInfo ? "popover fade show" : "popover fade"} style={{ top: currentFlowNode.y, left: currentFlowNode.x }}>
          <h3 className="popover-header">{currentFlowNode.businessObject.name}</h3>
          <div className="popover-body">
            Start : {currentFlowNode.instance.startDate}<br />
            End : {currentFlowNode.instance.endDate}
            {currentFlowNode.variables && currentFlowNode.variables.length > 0 ?
              <Table striped bordered>
                <thead>
                  <tr>
                    <th scope="col">Variable</th>
                    <th scope="col">Value</th>
                  </tr>
                </thead>
                <tbody>
                  {currentFlowNode.variables.map((variable: any, index: number) =>
                    <tr key={index}>
                      <td title={variable.name} style={{ maxWidth: 80, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{variable.name}</td>
                      <td title={variable.value} style={{ maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{variable.value}</td>
                    </tr>
                  )}
                </tbody>
              </Table>
              :
              <></>}
          </div>
        </div>
        : <></>}

    </>
  );
}

export default InstanceDiagram;
