package org.camunda.custom.operate.facade;

import io.camunda.zeebe.client.ZeebeClient;
import io.camunda.zeebe.client.api.command.ModifyProcessInstanceCommandStep1;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import org.camunda.custom.operate.exception.UnauthorizedException;
import org.camunda.custom.operate.facade.dto.ProcInstanceModificationRequest;
import org.camunda.custom.operate.security.annotation.IsAuthenticated;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@CrossOrigin
@RestController
@RequestMapping("/api/instance/modif")
public class InstanceModificationController extends AbstractController {
  private final Logger logger = LoggerFactory.getLogger(AuthenticationController.class);

  private final ZeebeClient zeebe;
  private final List<ProcInstanceModificationRequest> modificationRequests = new ArrayList<>();

  public InstanceModificationController(ZeebeClient client) {
    this.zeebe = client;
  }

  @IsAuthenticated
  @PostMapping
  public void requestModification(@RequestBody ProcInstanceModificationRequest request) {
    request.setId(Long.valueOf(modificationRequests.size()));
    request.setOpened(new Date());
    request.setRequester(getAuthenticatedUsername());
    request.setStatus("Open");
    modificationRequests.add(request);
  }

  @IsAuthenticated
  @DeleteMapping("/{id}")
  public void cancelRequestModification(@PathVariable Long id) {
    ProcInstanceModificationRequest request =
        modificationRequests.get(Integer.valueOf(id.toString()));
    if (request.getRequester().equals(getAuthenticatedUsername())) {
      request.setStatus("Canceled");
      request.setClosed(new Date());
      request.setRequester(getAuthenticatedUsername());
    } else {
      throw new UnauthorizedException("Only the requester can cancel his request");
    }
  }

  @IsAuthenticated
  @GetMapping("/{id}")
  public ProcInstanceModificationRequest getRequestModification(@PathVariable Long id) {
    return modificationRequests.get(Integer.valueOf(id.toString()));
  }

  @IsAuthenticated
  @GetMapping("/{id}/{state}")
  public void validateRequestModification(@PathVariable Long id, @PathVariable String state) {
    ProcInstanceModificationRequest request =
        modificationRequests.get(Integer.valueOf(id.toString()));
    // if (!request.getRequester().equals(getAuthenticatedUsername())) {
    request.setStatus(state);
    request.setClosed(new Date());
    request.setValidator(getAuthenticatedUsername());
    if (state.equals("approved")) {
      if (request.getVariables() != null && !request.getVariables().isEmpty()) {
        zeebe
            .newSetVariablesCommand(request.getInstanceKey())
            .variables(request.getVariables())
            .send();
      }
      if (request.getTerminateNodes() != null || request.getActivateNodes() != null) {
        ModifyProcessInstanceCommandStep1 modifyCmd =
            zeebe.newModifyProcessInstanceCommand(request.getInstanceKey());
        int steps = request.getTerminateNodes() != null ? request.getTerminateNodes().size() : 0;
        steps += request.getActivateNodes() != null ? request.getActivateNodes().size() : 0;
        int step = 1;
        for (String activating : request.getActivateNodes()) {
          if (step < steps) {
            modifyCmd = modifyCmd.activateElement(activating).and();
          } else {
            modifyCmd.activateElement(activating).send();
          }
          step++;
        }
        for (Long terminating : request.getTerminateNodes()) {
          if (step < steps) {
            modifyCmd = modifyCmd.terminateElement(terminating).and();
          } else {
            modifyCmd.terminateElement(terminating).send();
          }
          step++;
        }
      }
    }
    // } else {
    //  throw new UnauthorizedException("The requester can't validate his own request");
    // }
  }

  @Override
  public Logger getLogger() {
    return logger;
  }
}
