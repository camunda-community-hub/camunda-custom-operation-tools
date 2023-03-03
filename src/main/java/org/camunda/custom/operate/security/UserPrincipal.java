package org.camunda.custom.operate.security;

public class UserPrincipal {

  private String username;
  private String email;

  public UserPrincipal() {
    super();
  }

  public UserPrincipal(String username, String email) {
    super();
    this.username = username;
    this.email = email;
  }

  public String getUsername() {
    return username;
  }

  public void setUsername(String username) {
    this.username = username;
  }

  public String getEmail() {
    return email;
  }

  public void setEmail(String email) {
    this.email = email;
  }
}
