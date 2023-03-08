import React, { useState, useEffect } from 'react';
import processService from '../service/ProcessService';
import { Row, Col, Table, InputGroup, Accordion, Badge } from 'react-bootstrap';
import InstanceDiagram from '../components/InstanceDiagram';
import InstanceVariables from '../components/InstanceVariables';

function Instance() {

  const [request, setRequest] = useState<any | null>(null);
  const [instance, setInstance] = useState<any | null>(null);
  const [history, setHistory] = useState<any[] | null>(null);
  const [resultHistory, setResultHistory] = useState<any[] | null>(null);
  const [variables, setVariables] = useState<any[] | null>(null);
  const [processVariables, setProcessVariables] = useState<any[] | null>(null);
  const [resultProcessVariables, setResultProcessVariables] = useState<any[] | null>(null);
  const [xml, setXml] = useState<string | null>(null);

  useEffect(() => {
    loadRequest();
  }, []);

  const loadRequest = async () => {
    let url = window.location.href;
    let lastElt = url.substring(url.lastIndexOf("/") + 1, url.length);
    let req = await processService.loadChangeRequest(lastElt as unknown as number);
    if (req.variables && Object.keys(req.variables).length > 0) {
      let reqVars = [];
      for (let propertyName in req.variables) {
        reqVars.push({ name: propertyName, value: req.variables[propertyName] });
      }
      req.variables = reqVars;
    } else {
      req.variables = null;
    }
    setRequest(req);
  }
  useEffect(() => {
    loadProcessInstance();
  }, [request]);

  const loadProcessInstance = async () => {
    if (request) {
      setInstance(await processService.loadInstance(request.instanceKey));
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

  const loadHistory = async () => {
    if (instance && instance.key) {
      let instanceHisto = await processService.getHistory(instance.key);
      setHistory(instanceHisto);
      let result: any[] = JSON.parse(JSON.stringify(instanceHisto));
      if (request.terminateNodes && request.terminateNodes.length) {
        for (let i = 0; i < result.length; i++) {
          if (request.terminateNodes.indexOf(result[i].key) >= 0) {
            result[i].state = 'TERMINATED';
          }
        }
      }
      if (request.activateNodes) {
        for (let i = 0; i < request.activateNodes.length; i++) {
          result.splice(0,0,{
            key: i,
            processInstanceKey: request.instanceKey,
            startDate: new Date().toISOString(),
            endDate:null,
            flowNodeId: request.activateNodes[i],
            state: "ACTIVE",
            incident: false
          })
        }
      }
      console.log(result);
      setResultHistory(result);
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
      let result: any[] = Object.assign([], procVariables);
      if (request.variables && request.variables.length) {
        
        for (let i = 0; i < request.variables.length; i++) {
          let newVar = request.variables[i];
          let found = false;
          for (let j = 0; j < result.length && !found; j++) {
            if (result[j].name == newVar.name) {
              result[j].value = newVar.value;
              found = true;
            }
          }
          if (!found) {
            result.push(newVar);
          }
        }
      }
      setResultProcessVariables(result);
    }
  }
  
  return (
    <>
      <Accordion>
          <Accordion.Item key={0} eventKey={'0'} >
          <Accordion.Header>Modification request</Accordion.Header>
            <Accordion.Body>
          {request && request.variables && request.variables.length ?
            <Table variant="primary" striped bordered hover>
              <thead>
                <tr>
                  <th>Variable</th>
                  <th>Value</th>
                </tr>
              </thead>
              <tbody>
                {request.variables.map((myVar: any, index: number) =>
                  <tr key={index}>
                    <td>{myVar.name}</td>
                    <td>{myVar.value}</td>
                  </tr>
                )}
              </tbody>
            </Table>
            : <></>}
          {request && request.activateNodes && request.activateNodes.length ?
            <InputGroup className="mb-3">
              <InputGroup.Text>Activate</InputGroup.Text>

              <div className="userGroupList">
                {request.activateNodes.map((elt: string, index: number) => <Badge bg="primary" key={index}>{elt}</Badge>)}
              </div>
            </InputGroup>
            : <></>}
          {request && request.terminateNodes && request.terminateNodes.length ?
            <InputGroup className="mb-3">
              <InputGroup.Text>Terminate</InputGroup.Text>

              <div className="userGroupList">
                {request.terminateNodes.map((elt: string, index: number) => <Badge bg="primary" key={index}>{elt}</Badge>)}
              </div>
            </InputGroup>
              : <></>}
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>
    <Row>
        <Col xs={12} sm={12} md={6} lg={6} xl={6} xxl={6}>
          <h2>Current state</h2>
      {xml && history && variables ?
            <InstanceDiagram xml={xml} history={history} variables={variables} style={{ height: "calc(40vh - 95px)", position: "relative" }} />
        : <></>}
      {processVariables ?
        <InstanceVariables variables={processVariables} />
        : <></>}
        </Col>
        <Col xs={12} sm={12} md={6} lg={6} xl={6} xxl={6}>
          <h2>After approval</h2>
          {xml && resultHistory && variables ?
            <InstanceDiagram xml={xml} history={resultHistory} variables={variables} style={{ height: "calc(40vh - 95px)", position: "relative" }} />
        : <></>}
          {resultProcessVariables ?
        <InstanceVariables variables={resultProcessVariables} />
        : <></>}
        </Col>
      </Row>
      </>
  );
}

export default Instance;
