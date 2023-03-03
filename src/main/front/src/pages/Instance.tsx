import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import processService from '../service/ProcessService';
import NavigatedViewer, {
  Event,
  OverlayPosition,
} from 'bpmn-js/lib/NavigatedViewer';
import ElementTemplatesIconsRenderer from '@bpmn-io/element-template-icon-renderer';
import { BusinessObject } from 'bpmn-js/lib/NavigatedViewer';
import { Row, Col, Form, InputGroup, Table } from 'react-bootstrap';


function Instance() {

  const dispatch = useDispatch();
  const [instance, setInstance] = useState<any | null>(null);
  const [history, setHistory] = useState<any[] | null>(null);
  const [xml, setXml] = useState<string | null>(null);
  const [navigatedViewer, setNavigaterViewer] = useState<NavigatedViewer | null>(null);
  const diagramContainer = React.useRef<HTMLDivElement>(null);
  const [popoverX, setPopoverX] = useState<number>(0);
  const [popoverY, setPopoverY] = useState<number>(0);


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
      setHistory(await processService.getHistory(instance.key));
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
    console.log(event);
    console.log(isMultiInstance(flowNode.businessObject));
    setPopoverX(event.originalEvent.x);
    setPopoverY(event.originalEvent.y);
   
  };
  const hideInfoBox = () => {
    setPopoverX(0);
    setPopoverY(0);
  }
  const isMultiInstance = (businessObject?: BusinessObject) => {
    return (
      businessObject?.loopCharacteristics?.$type ===
      'bpmn:MultiInstanceLoopCharacteristics'
    );
  }

  return (
    <>
      
          <Row>
      <div ref={diagramContainer} style={{height: "calc(50vh - 95px)", position: "relative" }}>
      </div>
      <div className="popover" style={{ top: popoverY, left: popoverX }}>
        prout
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

              </tbody>
            </Table>
      </Row>
      </>
  );
}

export default Instance;
