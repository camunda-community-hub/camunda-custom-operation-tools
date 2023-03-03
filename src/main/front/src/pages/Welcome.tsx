import React from 'react';
import logo from '../assets/img/logo.svg'
import '../assets/css/welcome.css';
import { BrowserRouter, Route, Link } from "react-router-dom";

function Welcome() {
  return (
    <div className="container-fluid welcome">
      <div className="row justify-content-center">
        <div className="col-sm-10 col-sm-offset-1 col-md-8 col-md-offset-2 col-lg-8 col-lg-offset-2">
          <div className="row welcome-header">
            <div><img src={logo} alt="Camunda" width="150px"/></div>
            <h1>Welcome to <strong>Camunda</strong> custom Operate.</h1>
          </div>
          <div className="row">
            <div className="col-xs-12 col-sm-6">
              <div className="card-pf h-l">

                <div className="welcome-primary-link">
                  <h3><Link to="/admin" className="text-primary"><i className="bi bi-gear-wide-connected"></i> Operate console</Link></h3>
                  <div className="description">
                    View and manage your instances
                  </div>
                </div>
              </div>
            </div>
            <div className="col-xs-12 col-sm-6">
              <div className="card-pf h-m">
                <h3><a className="text-primary" href="https://docs.camunda.io/"><i className="bi bi-info-square"></i> Camunda documentation</a></h3>
              </div>
              <div className="card-pf h-m">
                <h3><a className="text-primary" href="https://github.com/camunda-community-hub"><i className="bi bi-heart"></i> Community Hub</a></h3>
            </div>
            <div className="card-pf h-m">
                <h3><a className="text-primary" href="https://github.com/chDame/camunda-custom-operate/issues"><i className="bi bi-bug"></i> Report an issue</a></h3>
          </div>
        </div>
      </div>
        </div>
      </div>
    </div>
  );
}

export default Welcome;
