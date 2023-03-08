import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import LoginHeader from '../components/LoginHeader'
import authService from '../service/AuthService';
import Alert from 'react-bootstrap/Alert';

function Restricted() {
  const dispatch = useDispatch();

  const logout = (event: any) => {
    //Prevent page reload
    event.preventDefault();
    dispatch(authService.signOut());
  };

  return (
    <>
      <LoginHeader />
      <main className="container-fluid mainSignin">
        <div className="d-flex justify-content-center">
          <form className="signin bg-dark text-light" onSubmit={logout}>
            <Alert variant="warning">Unsufficient privileges</Alert>

            <div className="signin__actions">
              <button type="submit" className="btn btn-primary btn-block mb-4"><i className="bi bi-send"></i> Sign out</button>
            </div>
          </form>
        </div>
      </main>
    </>
  );
}

export default Restricted;
