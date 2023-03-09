package org.camunda.custom.operate.jsonmodel;

import java.util.HashSet;
import java.util.Objects;
import java.util.Set;

public class User {

  private String username;
  private Password password;
  private String firstname;
  private String lastname;
  private String email;

  private Set<String> roles = new HashSet<>();

  public User() {}

  public User(String username, String password) {
    super();
    this.username = username;
    this.password = new Password(password);
  }

  public Password getPassword() {
    return password;
  }

  public User setPassword(Password password) {
    this.password = password;
    return this;
  }

  public String getUsername() {
    return username;
  }

  public User setUsername(String username) {
    this.username = username;
    return this;
  }

  public String getEmail() {
    return email;
  }

  public User setEmail(String email) {
    this.email = email;
    return this;
  }

  public String getFirstname() {
    return firstname;
  }

  public User setFirstname(String firstname) {
    this.firstname = firstname;
    return this;
  }

  public String getLastname() {
    return lastname;
  }

  public User setLastname(String lastname) {
    this.lastname = lastname;
    return this;
  }

  public Set<String> getRoles() {
    return roles;
  }

  public User setRoles(Set<String> roles) {
    this.roles = roles;
    return this;
  }

  public User addRole(String role) {
    this.roles.add(role);
    return this;
  }

  public User addRoles(String... roles) {
    for (String role : roles) {
      this.roles.add(role);
    }
    return this;
  }

  @Override
  public int hashCode() {
    return Objects.hash(username);
  }

  @Override
  public boolean equals(Object obj) {
    if (this == obj) return true;
    if (obj == null) return false;
    if (getClass() != obj.getClass()) return false;
    User other = (User) obj;
    return Objects.equals(username, other.username);
  }
}
