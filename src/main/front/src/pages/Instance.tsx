import React, { useState, useEffect } from 'react';
import processService from '../service/ProcessService';
import NavigatedViewer, {
    BpmnElement,
  Event,
} from 'bpmn-js/lib/NavigatedViewer';
import ElementTemplatesIconsRenderer from '@bpmn-io/element-template-icon-renderer';
import { BusinessObject } from 'bpmn-js/lib/NavigatedViewer';
import { Button, Modal, Table, InputGroup, DropdownButton, Dropdown, Badge, Form } from 'react-bootstrap';
import InstanceVariables from '../components/InstanceVariables';

let clickables: any[] = [];
let globalHisto: any[] = [];

const updateInstance: { instanceKey: number; terminateNodes: number[]; activateNodes: string[]; variables: any } = {
  instanceKey: 0,
  terminateNodes: [],
  activateNodes: [],
  variables: {}
}

function Instance() {

  const [instance, setInstance] = useState<any | null>(null);
  const [history, setHistory] = useState<any[] | null>(null);
  const [variables, setVariables] = useState<any[] | null>(null);
  const [processVariables, setProcessVariables] = useState<any[] | null>(null);
  const [xml, setXml] = useState<string | null>(null);
  const [navigatedViewer, setNavigaterViewer] = useState<NavigatedViewer | null>(null);
  const diagramContainer = React.useRef<HTMLDivElement>(null);
  const [showInfo, setShowInfo] = useState<boolean>(false);
  const [currentFlowNode, setCurrentFlowNode] = useState<any | null>(null);
  const [modifModal, setModifModal] = useState<boolean>(false);
  const [processElements, setProcessElements] = useState<BpmnElement[]>([]);
  const [activateFlowNodes, setActivateFlowNodes] = useState<BpmnElement[]>([]);
  const [activeNodes, setActiveNodes] = useState<any[]>([]);
  const [terminateFlowNodes, setTerminateFlowNodes] = useState<any[]>([]);
  const [modifVariables, setModifVariables] = useState<{ key: string; value:string }[]>([]);

  useEffect(() => {
    loadProcessInstance();
  }, []);

  const loadProcessInstance = async () => {
    let url = window.location.href;
    let lastElt = url.substring(url.lastIndexOf("/") + 1, url.length);
    setInstance(await processService.loadInstance(lastElt as unknown as number));
  }
  useEffect(() => {
    loadXmlDefinition();
    loadHistory();
    loadVariables();
    if (instance) {
      updateInstance.instanceKey = instance.key;
    }
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
      for (let i = history.length - 1; i >= 0; i--) {
        if (history[i].state != "TERMINATED") {
          if (history[i].incident === true) {
            colorActivity(history[i].flowNodeId, "#CC0000");
          } else if (history[i].state === "ACTIVE") {
            colorActivity(history[i].flowNodeId, "#00CC00");
          } else {
            colorActivity(history[i].flowNodeId, "#6699CC");
          }
        }
      }
    }
    if (navigatedViewer) {
      let allElts = navigatedViewer.get('elementRegistry').getAll();
      let activable: BpmnElement[] = [];
      for (let i = 0; i < allElts.length; i++) {
        if (allElts[i].type != "bpmn:SequenceFlow" &&
          allElts[i].type != "label" &&
          allElts[i].type != "bpmn:BoundaryEvent" &&
          allElts[i].type != "bpmn:Process") {
          activable.push(allElts[i]);
        }
      }
      setProcessElements(activable);
    }
    if (history && navigatedViewer) {
      let actives = [];
      for (let i = history.length - 1; i >= 0; i--) {
        if (history[i].state === "ACTIVE") {
          let clone = Object.assign({}, history[i]);
          clone.businessObject = navigatedViewer.get('elementRegistry').get(clone.flowNodeId).businessObject;
          actives.push(clone);
        }
      }
      setActiveNodes(actives);
    }

  }, [history, navigatedViewer]);

  const createViewer = async () => {

    if (diagramContainer.current?.hasChildNodes()) {
      diagramContainer.current?.removeChild(diagramContainer.current.children[0]);
    }
    if (xml) {
      let viewer = new NavigatedViewer({
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
      for (let i = globalHisto!.length - 1; i >= 0; i--) {
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
  const openStateModifModal = () => {
    setModifModal(true);
  }
  const addActivateFlowNode = (elt: BpmnElement) => {
    console.log(elt);
    if (updateInstance.activateNodes.indexOf(elt.id) < 0) {
      let clone = Object.assign([], activateFlowNodes);
      clone.push(elt);
      setActivateFlowNodes(clone);
      updateInstance.activateNodes.push(elt.id);
    }
  }
  const deleteActivateFlowNode = (index: number) => {
    let clone = Object.assign([], activateFlowNodes);
    clone.splice(index, 1);
    setActivateFlowNodes(clone);
    updateInstance.activateNodes.splice(index, 1);
  }
  const addTerminateFlowNode = (elt: any) => {
    if (updateInstance.terminateNodes.indexOf(elt.key) < 0) {
      let clone = Object.assign([], terminateFlowNodes);
      clone.push(elt);
      setTerminateFlowNodes(clone);
      updateInstance.terminateNodes.push(elt.key);
    }
  }
  const deleteTerminateFlowNode = (index: number) => {
    let clone = Object.assign([], terminateFlowNodes);
    clone.splice(index, 1);
    setTerminateFlowNodes(clone);
    updateInstance.terminateNodes.splice(index, 1);
  }
  const addVariable = () => {
    let copy = Object.assign([], modifVariables);
    copy.push({ key: "", value: "" });
    setModifVariables(copy);
  }
  const deleteVariable = (index: number) => {
    let copy = Object.assign([], modifVariables);
    copy.splice(index, 1);
    setModifVariables(copy);
  }
  const updateVariable = (index: number, property: string, value: string) => {
    let copy:any[] = Object.assign([], modifVariables);
    copy[index][property] = value;
    setModifVariables(copy);
  }
  const submitChangeRequest = async () => {
    updateInstance.variables = {};
    for (let i = 0; i < modifVariables.length; i++) {
      updateInstance.variables[modifVariables[i].key] = modifVariables[i].value;
    }
    let result = await processService.submitChangeRequest(updateInstance);
    if (result.id !== undefined) {
      setModifModal(false);
      updateInstance.terminateNodes = [];
      updateInstance.activateNodes = [];
      setModifVariables([]);
      setTerminateFlowNodes([]);
      setActivateFlowNodes([]);
    }
  }
  return (
    <>
      <div ref={diagramContainer} style={{ height: "calc(50vh - 95px)", position: "relative" }}>
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
      <Button variant="primary" onClick={openStateModifModal}>Change state</Button>
      {processVariables ?
        <InstanceVariables variables={processVariables} />
        : <></>}

      <Modal show={modifModal} animation={false} size="lg" onHide={() => setModifModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Instance modification</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Table variant="primary" striped bordered hover>
            <thead>
              <tr>
                <th>Variable</th>
                <th>Value</th>
                <th><Button variant="success" onClick={addVariable}><i className="bi bi-plus-circle"></i></Button></th>
              </tr>
            </thead>
            <tbody>
              {modifVariables.map((myVar: any, index: number) =>
                <tr key={index}>
                  <td>
                    <Form.Control value={myVar.key} onChange={(evt: any) => updateVariable(index, 'key', evt.target.value)} />
                  </td>
                  <td>
                    <Form.Control value={myVar.value} onChange={(evt: any) => updateVariable(index, 'value', evt.target.value)} />
                  </td>
                  <td><Button variant="danger" onClick={() => deleteVariable(index)}><i className="bi bi-trash"></i></Button></td>
                </tr>
              )}
            </tbody>
          </Table>
          <InputGroup className="mb-3">
            <DropdownButton
              variant="primary"
              title="Activate"
            >
              {processElements.map((elt: BpmnElement, index: number) =>
                <Dropdown.Item key={index} onClick={() => addActivateFlowNode(elt)}>{elt.businessObject.name ? elt.businessObject.name : elt.id}</Dropdown.Item>)}
            </DropdownButton>
            <div className="userGroupList">
              {activateFlowNodes.map((elt: BpmnElement, index: number) => <Badge bg="primary" key={index}>{elt.businessObject.name ? elt.businessObject.name : elt.id} <i className="bi bi-x" onClick={() => deleteActivateFlowNode(index)}></i></Badge>)}
            </div>
          </InputGroup>
          <InputGroup className="mb-3">
            <DropdownButton
              variant="primary"
              title="Terminate"
            >
              {activeNodes.map((elt: any, index: number) =>
                <Dropdown.Item key={index} onClick={() => addTerminateFlowNode(elt)}>{elt.businessObject.name ? elt.businessObject.name : elt.flowNodeId}</Dropdown.Item>)}
            </DropdownButton>
            <div className="userGroupList">
              {terminateFlowNodes.map((elt: any, index: number) => <Badge bg="primary" key={index}>{elt.businessObject.name ? elt.businessObject.name : elt.id} <i className="bi bi-x" onClick={() => deleteTerminateFlowNode(index)}></i></Badge>)}
            </div>
          </InputGroup>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={() => submitChangeRequest()}>Submit Request</Button>
          <Button variant="secondary" onClick={() => setModifModal(false)}>Close</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default Instance;
