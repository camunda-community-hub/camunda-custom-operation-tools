import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import processService from '../service/ProcessService';
import NavigatedViewer, {
  Event,
} from 'bpmn-js/lib/NavigatedViewer';
import ElementTemplatesIconsRenderer from '@bpmn-io/element-template-icon-renderer';
import { BusinessObject } from 'bpmn-js/lib/NavigatedViewer';
import { Row, Table } from 'react-bootstrap';

let clickables: any[] = [];
let globalHisto: any[] = [];

function Instance() {

  const dispatch = useDispatch();
  const [instance, setInstance] = useState<any | null>(null);
  const [history, setHistory] = useState<any[] | null>(null);
  const [variables, setVariables] = useState<any[] | null>(null);
  const [processVariables, setProcessVariables] = useState<any[] | null>(null);
  const [xml, setXml] = useState<string | null>(null);
  const [navigatedViewer, setNavigaterViewer] = useState<NavigatedViewer | null>(null);
  const diagramContainer = React.useRef<HTMLDivElement>(null);
  const [showInfo, setShowInfo] = useState<boolean>(false);
  const [currentFlowNode, setCurrentFlowNode] = useState<any | null>(null);


  useEffect(() => {
    loadProcessInstance();
  }, []);

  const loadProcessInstance = async () => {
    let url = window.location.href;
    let lastElt = url.substring(url.lastIndexOf("/") + 1, url.length);
    if (lastElt != '' && lastElt != 'elementTemplate') {
      setInstance(await processService.loadInstance(lastElt as unknown as number));
    }
  }
  useEffect(() => {
    loadXmlDefinition();
    loadHistory();
    loadVariables();
  }, [instance]);

  const loadXmlDefinition = async () => {
    if (instance && instance.processDefinitionKey && !xml) {
      setXml(await processService.getDefinition(instance.processDefinitionKey));
    }
  }
  useEffect(() => {
    createViewer();
  }, [xml]);

  const loadHistory = async () => {
    if (instance && instance.key) {
      globalHisto = await processService.getHistory(instance.key); 
      for (let i = 0; i < globalHisto.length; i++) {
        clickables.push(globalHisto[i].flowNodeId);
      }
      setHistory(globalHisto);
    }
  }
  const loadVariables = async () => {
    if (instance && instance.key) {
      let allVariables = await processService.getVariables(instance.key);
      setVariables(allVariables);
      let procVariables = [];
      for (let i = 0; i < allVariables.length; i++) {
        if (allVariables[i].scopeKey == instance.key) {
          procVariables.push(allVariables[i]);
        }
      }
      setProcessVariables(procVariables);
    }
  }
  useEffect(() => {
    if (history && navigatedViewer) {
      for (let i = 0; i < history.length; i++) {
      colorSequenceFlow(history[i].flowNodeId, "#6699CC");
    }
    }
  }, [history, navigatedViewer]);

  const createViewer = async () => {

    if (diagramContainer.current?.hasChildNodes()) {
      diagramContainer.current?.removeChild(diagramContainer.current.children[0]);
    }
    if (xml) {
      let viewer=new NavigatedViewer({
      container: diagramContainer.current!,
      bpmnRenderer: {
        height: 600,
        center: true,
        useMiniMap: true,
      },
      additionalModules: [ElementTemplatesIconsRenderer],
    });
      await viewer!.importXML(xml);

      viewer.on('element.click', displayInfoBox);
      viewer.on('canvas.viewbox.changing', () => {
        hideInfoBox();
      });
      setNavigaterViewer(viewer);
  }
  };

  const colorSequenceFlow = (id: string, color: string) => {
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
      let clone:any = Object.assign({}, flowNode);
      clone.businessObject = flowNode.businessObject;
      clone.x = event.originalEvent.x;
      clone.y = event.originalEvent.y;
      for (let i = 0; i < globalHisto!.length; i++) {
        if (globalHisto![i].flowNodeId == flowNode.id) {
          clone.instance = globalHisto![i];
        }
      }
      if (variables) {
        clone.variables = [];
        for (let i = 0; i < variables.length; i++) {
          if (variables[i].scopeKey == clone.instance.key) {
            clone.variables.push(variables[i]);
          }
        }
      }
      console.log(clone)
      setCurrentFlowNode(clone);
      setShowInfo(true);
    } else {
      setShowInfo(false);
    }
    console.log(event);
    console.log(isMultiInstance(flowNode.businessObject));
   
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
      
      
      <div ref={diagramContainer} style={{height: "calc(50vh - 95px)", position: "relative" }}>
        </div>
        {currentFlowNode ?
          <div className={showInfo ? "popover fade show" : "popover fade"} style={{ top: currentFlowNode.y, left: currentFlowNode.x }}>
          <h3 className="popover-header">{currentFlowNode.businessObject.name}</h3>
          <div className="popover-body">
            Start : {currentFlowNode.instance.startDate}<br/>
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

            <Table striped bordered hover>
              <thead>
                <tr>
                  <th scope="col">Process Variable</th>
              <th scope="col">Value</th>
                </tr>
              </thead>
              <tbody>
            {processVariables ? processVariables.map((variable: any, index:number) =>
              <tr key={index}>
                <td>{variable.name}</td>
                <td>{variable.value}</td>
              </tr>
            )
              :
              <></>
            }
              </tbody>
            </Table>
      </>
  );
}

export default Instance;
