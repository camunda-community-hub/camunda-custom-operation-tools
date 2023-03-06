package org.camunda.custom.operate.facade.dto;

import java.util.Date;
import java.util.List;
import java.util.Map;

public class ProcInstanceModificationRequest {
  private Long id;
  private Long instanceKey;
  private String requester;
  private String validator;
  private Date opened;
  private Date closed;
  private String status;
  private List<Long> terminateNodes;
  private List<String> activateNodes;
  private Map<String, String> variables;

  public Long getId() {
    return id;
  }

  public void setId(Long id) {
    this.id = id;
  }

  public Long getInstanceKey() {
    return instanceKey;
  }

  public void setInstanceKey(Long instanceKey) {
    this.instanceKey = instanceKey;
  }

  public String getRequester() {
    return requester;
  }

  public void setRequester(String requester) {
    this.requester = requester;
  }

  public String getValidator() {
    return validator;
  }

  public void setValidator(String validator) {
    this.validator = validator;
  }

  public Date getOpened() {
    return opened;
  }

  public void setOpened(Date opened) {
    this.opened = opened;
  }

  public Date getClosed() {
    return closed;
  }

  public void setClosed(Date closed) {
    this.closed = closed;
  }

  public String getStatus() {
    return status;
  }

  public void setStatus(String status) {
    this.status = status;
  }

  public List<Long> getTerminateNodes() {
    return terminateNodes;
  }

  public void setTerminateNodes(List<Long> terminateNodes) {
    this.terminateNodes = terminateNodes;
  }

  public List<String> getActivateNodes() {
    return activateNodes;
  }

  public void setActivateNodes(List<String> activateNodes) {
    this.activateNodes = activateNodes;
  }

  public Map<String, String> getVariables() {
    return variables;
  }

  public void setVariables(Map<String, String> variables) {
    this.variables = variables;
  }
}
