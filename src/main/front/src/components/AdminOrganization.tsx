import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Organization } from '../store/model';
import adminOrgService from '../service/AdminOrgService';
import AdminUsers from './AdminUsers'
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import Col from 'react-bootstrap/Col';
import Nav from 'react-bootstrap/Nav';
import Row from 'react-bootstrap/Row';
import Tab from 'react-bootstrap/Tab';
import Button from 'react-bootstrap/Button';

function AdminOrganization(orgParam: { organization: Organization }) {
  const dispatch = useDispatch();
  const org = JSON.parse(JSON.stringify(orgParam.organization));

  const setActive = () => {
    dispatch(adminOrgService.setActive(org));
  }
  const save = () => {
    dispatch(adminOrgService.save(org));
  }

  const changeName = (value: string) => {
    org.name = value;
  }

  return (
    <div className="organizationContainer">
      <Row>
        <Col>
          <InputGroup className="mb-3">
            <InputGroup.Text>Organization name</InputGroup.Text>
            <Form.Control aria-label="Orgnization name" defaultValue={org.name} onChange={event => changeName(event.target.value)} />
          </InputGroup>
        </Col>
        <Col>
          {org.active ? <></> : <Button variant="primary" onClick={setActive}><i className="bi bi-check-lg"></i> Set as active</Button>}
          <Button variant="primary" onClick={save}><i className="bi bi-hdd"></i> Save</Button>
        </Col>
      </Row>
      <Tab.Container id="left-tabs-example" defaultActiveKey="users">
        <AdminUsers organization={org} />
      </Tab.Container>
    </div>
  );
}

export default AdminOrganization
