import React, { useState, useEffect } from 'react';
import { Organization, IUser } from '../store/model';
import { Table, Form, Button, Col, Row, Card, InputGroup, DropdownButton, Dropdown, Badge } from 'react-bootstrap';

function AdminUsers(orgParam: { organization: Organization }) {
  const [users, setUsers] = useState<IUser[]>(orgParam.organization.users);
  const [userIdx, setUserIdx] = useState<number | null>(orgParam.organization.users.length > 0 ? 0 : null);
  const [user, setUser] = useState<IUser | null>(orgParam.organization.users.length > 0 ? orgParam.organization.users[0] : null);
  const emptyUser: IUser = { username: "", firstname: "", lastname: "", roles: [], password: { value: "", encrypted: false } };
  type ObjectKey = keyof typeof emptyUser;

  const deleteUser = (index: number) => {
    orgParam.organization.users.splice(index, 1);
    setUsers(Object.assign([], orgParam.organization.users));
  }
  const addUser = () => {
    orgParam.organization.users.push(JSON.parse(JSON.stringify(emptyUser)));
    setUsers(Object.assign([], orgParam.organization.users));
  }
  const editUser = (index: number) => {
    setUserIdx(index);
    setUser(orgParam.organization.users[index]);
  }
  const changeUser = (property: ObjectKey, value: any) => {
    orgParam.organization.users[userIdx!]![property] = value;
    setUser(Object.assign({}, orgParam.organization.users[userIdx!]));
  }
  const changePassword = (value: string) => {
    orgParam.organization.users[userIdx!]!.password!.value = value;
    orgParam.organization.users[userIdx!]!.password!.encrypted = false;
    setUser(Object.assign({}, orgParam.organization.users[userIdx!]));
  }
  const updateUser = () => {
    orgParam.organization.users[userIdx!] = user!;
    setUsers(Object.assign([], orgParam.organization.users));
  }
  const addRole = (role: string) => {
    let clone: IUser = Object.assign({}, user);
    if (clone.roles.indexOf(role) < 0) {
      clone.roles.push(role);
    }
    setUser(clone);
  }
  const removeRole = (index: number) => {
    let clone: IUser = Object.assign({}, user);
    clone.roles.splice(index, 1);
    setUser(clone);
  }

  return (
    <Row>
      <Col sm={5}>
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>#</th>
              <th>Username</th>
              <th><Button variant="success" onClick={addUser}><i className="bi bi-plus-circle"></i></Button></th>
            </tr>
          </thead>
          <tbody>
            {users ? users.map((user: IUser, index: number) =>
              <tr key={user.username + index}>
                <td>{index}</td>
                <td>{user.username}</td>
                <td><Button variant="info" onClick={() => editUser(index)}><i className="bi bi-pencil"></i></Button><Button variant="danger" onClick={() => deleteUser(index)}><i className="bi bi-trash"></i></Button></td>
              </tr>
            ) : <></>}
          </tbody>
        </Table>
      </Col>
      <Col sm={7}>
        {user ?
          <Card>
            <Card.Body>
              <Card.Title>{user.username}</Card.Title>
              <InputGroup className="mb-3">
                <InputGroup.Text>Username</InputGroup.Text>
                <Form.Control aria-label="Username" value={user.username} onChange={(evt) => changeUser('username', evt.target.value)} />
              </InputGroup>
              <InputGroup className="mb-3">
                <InputGroup.Text>Firstname</InputGroup.Text>
                <Form.Control aria-label="Firstname" value={user.firstname} onChange={(evt) => changeUser('firstname', evt.target.value)} />
              </InputGroup>
              <InputGroup className="mb-3">
                <InputGroup.Text>Lastname</InputGroup.Text>
                <Form.Control aria-label="Lastname" value={user.lastname} onChange={(evt) => changeUser('lastname', evt.target.value)} />
              </InputGroup>
              <InputGroup className="mb-3">
                <DropdownButton
                  variant="primary"
                  title="Roles">
                  <Dropdown.Item onClick={() => addRole('viewVariables')}>view variables</Dropdown.Item>
                  {user.roles.indexOf('viewVariables') >= 0 ?
                    <Dropdown.Item onClick={() => addRole('modifVariables')}>variable modification</Dropdown.Item> : <></>}
                  <Dropdown.Item onClick={() => addRole('modifState')}>state modification</Dropdown.Item>
                  <Dropdown.Item onClick={() => addRole('approveModif')}>approve modification request</Dropdown.Item>
                  {user.roles.indexOf('approveModif') >= 0 ?
                    <Dropdown.Item onClick={() => addRole('autoApproveModif')}>auto approve modification</Dropdown.Item> : <></>}

                  <Dropdown.Item onClick={() => addRole('adminUsers')}>admin users</Dropdown.Item>
                </DropdownButton>
                <div className="userRoleList">
                  {user.roles.map((elt: string, index: number) => <Badge bg="primary" key={index}>{elt} <i className="bi bi-x" onClick={() => removeRole(index)}></i></Badge>)}
                </div>
              </InputGroup>
              <InputGroup className="mb-3">
                <InputGroup.Text>Password</InputGroup.Text>
                <Form.Control type="password" aria-label="Password" value={user.password!.value} onChange={event => changePassword(event.target.value)} />
              </InputGroup>
              <Button variant="primary" onClick={updateUser}>Validate</Button>
            </Card.Body>
          </Card>
          : <></>
        }
      </Col>
    </Row>
  );
}

export default AdminUsers
