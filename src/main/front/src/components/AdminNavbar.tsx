import React, { useState, useEffect } from "react";
import { BrowserRouter, Route, Link, NavLink } from "react-router-dom";
import { useDispatch, useSelector } from 'react-redux';
import authService from '../service/AuthService';
import adminOrgService from '../service/AdminOrgService';
import logo from '../assets/img/logo.svg';

function AdminNavbar() {
  const user = useSelector((state: any) => state.auth.data)
  const orgEnabled = useSelector((state: any) => state.adminOrg.enabled)

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(adminOrgService.checkIfEnabled());
  }, []);
  const logout = (event: any) => {
    dispatch(authService.signOut());
  };
  return (
    <>
      <nav className="navbar navbar-light bg-light" >
        <div className="container-fluid">
          <Link to="/home"><img width="120" src={logo} className="custom-logo" alt="Camunda" /></Link>

        </div>

          <div className="bg-primary menu">
            <NavLink className={({ isActive }) =>
              isActive ? "text-light menu-item selected" : "text-light menu-item"
            } to="/admin/instances">Instances</NavLink>
            <NavLink className={({ isActive }) =>
              isActive ? "text-light menu-item selected" : "text-light menu-item"
            } to="/admin/modifRequests">Instances Modifications</NavLink>
            {orgEnabled && user!.profile === 'Admin' ?
                <NavLink className={({ isActive }) =>
                  isActive ? "text-light menu-item selected" : "text-light menu-item"
                } to="/admin/users">Users</NavLink>
              : <></>
            }
          </div>
      </nav>
    </>
  );
}

export default AdminNavbar;
