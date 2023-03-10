import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import processService from '../service/ProcessService';
import InstanceVariables from '../components/InstanceVariables';
import InstanceDiagram from '../components/InstanceDiagram';


function Instance() {

  const user = useSelector((state: any) => state.auth.data)
  const [instance, setInstance] = useState<any | null>(null);
  const [history, setHistory] = useState<any[] | null>(null);
  const [variables, setVariables] = useState<any[] | null>(null);
  const [processVariables, setProcessVariables] = useState<any[] | null>(null);
  const [xml, setXml] = useState<string | null>(null);

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
    if (user!.roles.indexOf('viewVariables') >= 0) {
      loadVariables();
    } else {
      setVariables([]);
      setProcessVariables([]);
    }
  }, [instance]);

  const loadXmlDefinition = async () => {
    if (instance && instance.processDefinitionKey && !xml) {
      setXml(await processService.getDefinition(instance.processDefinitionKey));
    }
  }

  const loadHistory = async () => {
    if (instance && instance.key) {
      setHistory(await processService.getHistory(instance.key));
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

  return (
    <>
      {instance && xml && history && variables ?
        <InstanceDiagram instance={instance} modif={true} xml={xml} history={history} variables={variables} style={{ height: "calc(50vh - 95px)", position: "relative" }} />
        : <></>}
      {processVariables ?
        <InstanceVariables variables={processVariables} />
        : <></>}


    </>
  );
}

export default Instance;
