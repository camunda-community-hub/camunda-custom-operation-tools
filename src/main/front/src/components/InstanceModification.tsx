import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import processService from '../service/ProcessService';
import {
  BpmnElement
} from 'bpmn-js/lib/NavigatedViewer';

import { Button, Modal, Table, InputGroup, DropdownButton, Dropdown, Badge, Form } from 'react-bootstrap';

type Params = {
  instance: any;
  processElements: BpmnElement[];
  activeNodes: any[];
}

const updateInstance: { instanceKey: number; terminateNodes: number[]; activateNodes: string[]; variables: any } = {
  instanceKey: 0,
  terminateNodes: [],
  activateNodes: [],
  variables: {}
}

function InstanceModification(params: Params) {

  const user = useSelector((state: any) => state.auth.data);
  const [modifModal, setModifModal] = useState<boolean>(false);
  const [activateFlowNodes, setActivateFlowNodes] = useState<BpmnElement[]>([]);
  const [terminateFlowNodes, setTerminateFlowNodes] = useState<any[]>([]);
  const [modifVariables, setModifVariables] = useState<{ key: string; value: string }[]>([]);


  const openStateModifModal = () => {
    setModifModal(true);
  }
  const addActivateFlowNode = (elt: BpmnElement) => {
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
    let copy: any[] = Object.assign([], modifVariables);
    copy[index][property] = value;
    setModifVariables(copy);
  }
  const submitChangeRequest = async () => {
    updateInstance.instanceKey = params.instance.key;
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
    user.roles.indexOf('modifVariables') >= 0 || user!.roles.indexOf('modifState') >= 0 ?
      <>
        <Button variant="primary" onClick={openStateModifModal}>Change state</Button>

        <Modal show={modifModal} animation={false} size="lg" onHide={() => setModifModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Instance modification</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {user!.roles.indexOf('modifVariables') >= 0 ?
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
              : <></>}
            {user!.roles.indexOf('modifState') >= 0 ?
              <>
                <InputGroup className="mb-3">
                  <DropdownButton
                    variant="primary"
                    title="Activate"
                  >
                    {params.processElements.map((elt: BpmnElement, index: number) =>
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
                    {params.activeNodes.map((elt: any, index: number) =>
                      <Dropdown.Item key={index} onClick={() => addTerminateFlowNode(elt)}>{elt.businessObject.name ? elt.businessObject.name : elt.flowNodeId}</Dropdown.Item>)}
                  </DropdownButton>
                  <div className="userGroupList">
                    {terminateFlowNodes.map((elt: any, index: number) => <Badge bg="primary" key={index}>{elt.businessObject.name ? elt.businessObject.name : elt.id}<br />{elt.key} <i className="bi bi-x" onClick={() => deleteTerminateFlowNode(index)}></i></Badge>)}
                  </div>
                </InputGroup>
              </>
              : <></>}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="primary" onClick={() => submitChangeRequest()}>Submit Request</Button>
            <Button variant="secondary" onClick={() => setModifModal(false)}>Close</Button>
          </Modal.Footer>
        </Modal>
      </>
      : <></>
  );
}

export default InstanceModification;
