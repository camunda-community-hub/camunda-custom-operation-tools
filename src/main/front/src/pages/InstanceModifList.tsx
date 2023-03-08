import React, { useState, useEffect } from 'react';
import processService from '../service/ProcessService';
import Table from 'react-bootstrap/Table';
import { Link } from "react-router-dom";

function InstanceModifList() {
  const [requests, setRequests] = useState<any[] | null>(null);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    setRequests(await processService.loadChangeRequests());
  }


  return (
    <div>
      
      <Table striped bordered hover>
		<thead>
		  <tr>
            <th scope="col">Id</th>
            <th scope="col">Instance key</th>
            <th scope="col">Requester</th>
            <th scope="col">Validator</th>
            <th scope="col">Status</th>
            <th scope="col">Opened</th>
            <th scope="col">Closed</th>
            <th scope="col">Summary</th>
          </tr>
        </thead>
        <tbody>
          {requests ? requests.map((request: any, index: number) =>
            <tr key={index}>
              <td><Link to={"/admin/modifrequest/" + request.id} >{request.id}</Link></td>
              <td>{request.instanceKey}</td>
              <td>{request.requester}</td>
              <td>{request.validator}</td>
              <td>{request.status}</td>
              <td>{request.opened ? request.opened.substring(0,19).replace('T',' ') : ''}</td>
              <td>{request.closed ? request.closed.substring(0, 19).replace('T', ' ') : ''}</td>
              <td>{request.terminateNodes && request.terminateNodes.length > 0 ? "terminate nodes; " : ""}
                {request.activateNodes && request.activateNodes.length > 0 ? "activate nodes; " : ""}
                {request.variables && Object.keys(request.variables).length > 0 ? "modify variables" : ""}
              </td>
            </tr>)
          : <></>}
		</tbody>
      </Table>
  </div >
  );
}

export default InstanceModifList
