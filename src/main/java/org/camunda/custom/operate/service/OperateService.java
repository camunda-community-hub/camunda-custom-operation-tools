package org.camunda.custom.operate.service;

import io.camunda.operate.CamundaOperateClient;
import io.camunda.operate.auth.SaasAuthentication;
import io.camunda.operate.auth.SelfManagedAuthentication;
import io.camunda.operate.dto.FlownodeInstance;
import io.camunda.operate.dto.ProcessDefinition;
import io.camunda.operate.dto.ProcessInstance;
import io.camunda.operate.exception.OperateException;
import io.camunda.operate.search.FlownodeInstanceFilter;
import io.camunda.operate.search.ProcessDefinitionFilter;
import io.camunda.operate.search.ProcessInstanceFilter;
import io.camunda.operate.search.SearchQuery;
import io.camunda.operate.search.Sort;
import io.camunda.operate.search.SortOrder;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.stereotype.Service;

@Service
@EnableCaching
public class OperateService {

  private static final Logger LOG = LoggerFactory.getLogger(OperateService.class);

  @Value("${zeebe.client.cloud.client-id:notProvided}")
  private String clientId;

  @Value("${zeebe.client.cloud.client-secret:notProvided}")
  private String clientSecret;

  @Value("${zeebe.client.cloud.clusterId:notProvided}")
  private String clusterId;

  @Value("${zeebe.client.cloud.region:notProvided}")
  private String region;

  @Value("${identity.clientId:notProvided}")
  private String identityClientId;

  @Value("${identity.clientSecret:notProvided}")
  private String identityClientSecret;

  @Value("${operateUrl:notProvided}")
  private String operateUrl;

  @Value("${keycloakUrl:notProvided}")
  private String keycloakUrl;

  private CamundaOperateClient client;

  private CamundaOperateClient getCamundaOperateClient() throws OperateException {
    if (client == null) {
      if (!"notProvided".equals(clientId)) {
        SaasAuthentication sa = new SaasAuthentication(clientId, clientSecret);
        client =
            new CamundaOperateClient.Builder()
                .operateUrl("https://" + region + ".operate.camunda.io/" + clusterId)
                .authentication(sa)
                .build();
      } else {
        SelfManagedAuthentication la =
            new SelfManagedAuthentication()
                .clientId(identityClientId)
                .clientSecret(identityClientSecret)
                .keycloakUrl(keycloakUrl);
        client =
            new CamundaOperateClient.Builder().operateUrl(operateUrl).authentication(la).build();
      }
    }
    return client;
  }

  public List<ProcessDefinition> getProcessDefinitions() throws OperateException {
    ProcessDefinitionFilter processDefinitionFilter = new ProcessDefinitionFilter.Builder().build();
    SearchQuery procDefQuery =
        new SearchQuery.Builder()
            .filter(processDefinitionFilter)
            .size(1000)
            .sort(new Sort("version", SortOrder.DESC))
            .build();

    return getCamundaOperateClient().searchProcessDefinitions(procDefQuery);
  }

  public List<ProcessDefinition> getProcessDefinitionByBpmnProcessId(String bpmnProcessId)
      throws OperateException {
    ProcessDefinitionFilter processDefinitionFilter =
        new ProcessDefinitionFilter.Builder().bpmnProcessId(bpmnProcessId).build();
    SearchQuery procDefQuery =
        new SearchQuery.Builder()
            .filter(processDefinitionFilter)
            .size(1000)
            .sort(new Sort("version", SortOrder.DESC))
            .build();

    return getCamundaOperateClient().searchProcessDefinitions(procDefQuery);
  }

  @Cacheable("processXmls")
  public String getProcessDefinitionXmlByKey(Long key) throws OperateException {
    LOG.info("Entering getProcessDefinitionXmlByKey for key " + key);
    return getCamundaOperateClient().getProcessDefinitionXml(key);
  }

  public List<ProcessInstance> getProcessInstancesByBpmnProcessId(String bpmnProcessId)
      throws OperateException {
    ProcessInstanceFilter processInstanceFilter =
        new ProcessInstanceFilter.Builder().bpmnProcessId(bpmnProcessId).build();
    SearchQuery procInstQuery =
        new SearchQuery.Builder()
            .filter(processInstanceFilter)
            .size(1000)
            .sort(new Sort("startDate", SortOrder.DESC))
            .build();

    return getCamundaOperateClient().searchProcessInstances(procInstQuery);
  }

  public List<ProcessInstance> getProcessInstancesByBpmnProcessIdAndVersion(
      String bpmnProcessId, Long version) throws OperateException {
    ProcessInstanceFilter processInstanceFilter =
        new ProcessInstanceFilter.Builder()
            .bpmnProcessId(bpmnProcessId)
            .processVersion(version)
            .build();
    SearchQuery procInstQuery =
        new SearchQuery.Builder()
            .filter(processInstanceFilter)
            .size(1000)
            .sort(new Sort("startDate", SortOrder.DESC))
            .build();

    return getCamundaOperateClient().searchProcessInstances(procInstQuery);
  }

  public List<FlownodeInstance> getProcessInstanceHistory(Long processInstanceKey)
      throws OperateException {
    FlownodeInstanceFilter flowNodeFilter =
        new FlownodeInstanceFilter.Builder().processInstanceKey(processInstanceKey).build();
    SearchQuery procInstQuery =
        new SearchQuery.Builder()
            .filter(flowNodeFilter)
            .size(1000)
            .sort(new Sort("startDate", SortOrder.DESC))
            .build();

    return getCamundaOperateClient().searchFlownodeInstances(procInstQuery);
  }

  public ProcessInstance getProcessInstance(Long processInstanceKey) throws OperateException {
    return getCamundaOperateClient().getProcessInstance(processInstanceKey);
  }
}
