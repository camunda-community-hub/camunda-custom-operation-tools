package org.camunda.custom.operate.facade;

import io.camunda.operate.dto.FlownodeInstance;
import io.camunda.operate.dto.ProcessDefinition;
import io.camunda.operate.dto.ProcessInstance;
import io.camunda.operate.dto.Variable;
import io.camunda.operate.exception.OperateException;
import io.camunda.zeebe.client.ZeebeClient;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import org.camunda.custom.operate.security.annotation.IsAuthenticated;
import org.camunda.custom.operate.service.OperateService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@CrossOrigin
@RestController
@RequestMapping("/api/process")
public class ProcessController {

  private static final Logger LOG = LoggerFactory.getLogger(ProcessController.class);
  private final ZeebeClient zeebe;
  private final OperateService operateService;

  public ProcessController(ZeebeClient client, OperateService operateService) {
    this.zeebe = client;
    this.operateService = operateService;
  }

  @IsAuthenticated
  @PostMapping("/{bpmnProcessId}/start")
  public void startProcessInstance(
      @PathVariable String bpmnProcessId, @RequestBody Map<String, Object> variables) {

    LOG.info("Starting process `" + bpmnProcessId + "` with variables: " + variables);

    zeebe
        .newCreateInstanceCommand()
        .bpmnProcessId(bpmnProcessId)
        .latestVersion()
        .variables(variables)
        .send();
  }

  @IsAuthenticated
  @PostMapping("/message/{messageName}/{correlationKey}")
  public void publishMessage(
      @PathVariable String messageName,
      @PathVariable String correlationKey,
      @RequestBody Map<String, Object> variables) {

    LOG.info(
        "Publishing message `{}` with correlation key `{}` and variables: {}",
        messageName,
        correlationKey,
        variables);

    zeebe
        .newPublishMessageCommand()
        .messageName(messageName)
        .correlationKey(correlationKey)
        .variables(variables)
        .send();
  }

  @IsAuthenticated
  @GetMapping("/definition/latest")
  public List<ProcessDefinition> latestDefinitions() throws OperateException {
    Set<String> present = new HashSet<>();
    List<ProcessDefinition> result = new ArrayList<>();
    List<ProcessDefinition> processDefs = operateService.getProcessDefinitions();
    if (processDefs != null) {
      for (ProcessDefinition def : processDefs) {
        if (!present.contains(def.getBpmnProcessId())) {
          result.add(def);
          present.add(def.getBpmnProcessId());
        }
      }
    }
    return result;
  }

  @IsAuthenticated
  @GetMapping("/definition/{bpmnProcessId}/versions")
  public List<ProcessDefinition> latestDefinitions(@PathVariable String bpmnProcessId)
      throws OperateException {
    return operateService.getProcessDefinitionByBpmnProcessId(bpmnProcessId);
  }

  @IsAuthenticated
  @GetMapping("/definition/{key}/xml")
  public String getProcessDefinitionXmlByKey(@PathVariable Long key) throws OperateException {
    return operateService.getProcessDefinitionXmlByKey(key);
  }

  @IsAuthenticated
  @GetMapping("/{bpmnProcessId}/instances")
  public List<ProcessInstance> instances(@PathVariable String bpmnProcessId)
      throws OperateException {
    return operateService.getProcessInstancesByBpmnProcessId(bpmnProcessId);
  }

  @IsAuthenticated
  @GetMapping("/{bpmnProcessId}/{version}/instances")
  public List<ProcessInstance> instances(
      @PathVariable String bpmnProcessId, @PathVariable Long version) throws OperateException {
    return operateService.getProcessInstancesByBpmnProcessIdAndVersion(bpmnProcessId, version);
  }

  @IsAuthenticated
  @GetMapping("/{processInstanceKey}")
  public ProcessInstance getProcessInstance(@PathVariable Long processInstanceKey)
      throws OperateException {
    return operateService.getProcessInstance(processInstanceKey);
  }

  @IsAuthenticated
  @GetMapping("/{processInstanceKey}/flownodes")
  public List<FlownodeInstance> getProcessInstanceHistory(@PathVariable Long processInstanceKey)
      throws OperateException {
    return operateService.getProcessInstanceHistory(processInstanceKey);
  }

  @IsAuthenticated
  @GetMapping("/{processInstanceKey}/variables")
  public List<Variable> getProcessInstanceVariables(@PathVariable Long processInstanceKey)
      throws OperateException {
    return operateService.getProcessInstanceVariables(processInstanceKey);
  }
}
