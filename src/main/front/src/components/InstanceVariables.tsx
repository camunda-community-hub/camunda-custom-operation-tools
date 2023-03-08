import { Table } from 'react-bootstrap';

type Params = {
  variables: any[];
};
function InstanceVariables(params: Params) {
  return (
      <Table striped bordered hover>
        <thead>
          <tr>
            <th scope="col">Process Variable</th>
            <th scope="col">Value</th>
          </tr>
        </thead>
      <tbody>
        {params.variables.map((variable: any, index: number) =>
            <tr key={index}>
              <td>{variable.name}</td>
              <td>{variable.value}</td>
            </tr>
          )}
        </tbody>
      </Table>
  );
}

export default InstanceVariables;
