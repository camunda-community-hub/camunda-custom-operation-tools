import React, { useState, useEffect } from 'react';
import processService from '../service/ProcessService';
import NavigatedViewer, {
  Event,
} from 'bpmn-js/lib/NavigatedViewer';
import ElementTemplatesIconsRenderer from '@bpmn-io/element-template-icon-renderer';
import { BusinessObject } from 'bpmn-js/lib/NavigatedViewer';
import { Link } from "react-router-dom";
import { Row, Col, Form, InputGroup, Table } from 'react-bootstrap';


function InstancesList() {

  const [processes, setProcesses] = useState<any[]>([]);
  const [versions, setVersions] = useState<any[]>([]);
  const [bpmnVersionId, setBpmnVersionId] = useState<string>("");
  const [versionIdx, setVersionIdx] = useState<number>(0);
  const [processDef, setProcessDef] = useState<any | null>(null);
  const [xml, setXml] = useState<string | null>(null);
  const [instances, setInstances] = useState<any[] | null>(null);
  const diagramContainer = React.useRef<HTMLDivElement>(null);
  let navigatedViewer: NavigatedViewer | null = null;

  const createViewer = async () => {

    if (diagramContainer.current?.hasChildNodes()) {
      diagramContainer.current?.removeChild(diagramContainer.current.children[0]);
    }
    if (xml) {
      navigatedViewer = new NavigatedViewer({
        container: diagramContainer.current!,
        bpmnRenderer: {
          height: 600,
          center: true,
          useMiniMap: true,
        },
        additionalModules: [ElementTemplatesIconsRenderer],
      });
      await navigatedViewer!.importXML(xml);
    }
  };

  useEffect(() => {
    loadProcesses();
  }, []);

  const loadProcesses = async () => {
    let proc = await processService.listProcesses();
    setProcesses(proc);
  }
  useEffect(() => {
    if (processes && processes.length > 0) {
      selectProcess(processes[0].bpmnProcessId);
    }
  }, [processes]);

  const selectProcess = async (proc: string) => {
    setBpmnVersionId(proc);
    setVersions(await processService.listVersions(proc));
  }

  useEffect(() => {
    selectVersion(0);
  }, [versions]);


  const selectVersion = (idx: number) => {
    if (versions && versions.length > 0) {
      setVersionIdx(idx);
      setProcessDef(versions[idx]);
    }
  }
  useEffect(() => {
    loadXmlDefinition();
    loadInstances();
  }, [processDef]);

  const loadXmlDefinition = async () => {
    if (processDef && processDef.key) {
      setXml(await processService.getDefinition(processDef.key));
    }
  }

  const loadInstances = async () => {
    if (processDef && processDef.key) {
      setInstances(await processService.loadInstances(processDef.bpmnProcessId, processDef.version));
    }
  }
  useEffect(() => {
    createViewer();
  }, [xml]);

  return (
    <>
      <Row>
        <Col xs={12} sm={6} md={4} lg={4} xl={3} xxl={2}>
          <InputGroup className="mb-3">
            <InputGroup.Text>Processes</InputGroup.Text>
            <Form.Select value={bpmnVersionId} onChange={(evt) => selectProcess(evt.target.value)}>
              {processes ? processes.map((process: any, index: number) =>
                <option key={index} value={process.bpmnProcessId}>{process.name ? process.name : process.bpmnProcessId}</option>
              )
                :
                <></>
              }
            </Form.Select>
          </InputGroup>
          <InputGroup className="mb-3">
            <InputGroup.Text>Versions</InputGroup.Text>
            <Form.Select value={versionIdx} onChange={(evt) => selectVersion(evt.target.value as unknown as number)} disabled={!versions}>
              {versions ? versions.map((version: any, index: number) =>
                <option key={index} value={index}>{version.version}</option>
              )
                :
                <></>
              }
            </Form.Select>
          </InputGroup>
        </Col>
        <Col xs={12} sm={6} md={8} lg={8} xl={9} xxl={10}>
          <Row>
            <div ref={diagramContainer} style={{ height: "calc(50vh - 95px)", position: "relative" }}>
            </div>
          </Row>
          <Row>
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th scope="col">Key</th>
                  <th scope="col">StartDate</th>
                  <th scope="col">End Date</th>
                  <th scope="col">State</th>
                </tr>
              </thead>
              <tbody>
                {instances ? instances.map((instance: any) =>
                  <tr key={instance.key}>
                    <td><Link to={"/admin/instance/" + instance.key} >{instance.key}</Link></td>
                    <td>{instance.startDate}</td>
                    <td>{instance.endDate}</td>
                    <td>{instance.state}</td>
                  </tr>
                )
                  :
                  <></>
                }
              </tbody>
            </Table>
          </Row>
        </Col>
      </Row>
    </>
  );
}

export default InstancesList;
