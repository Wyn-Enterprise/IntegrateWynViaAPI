import React from 'react';
import Authorization from './components/Authorization';
import ReportsList from './components/ReportsList';
import ReportsView from './components/ReportsView';
//import DashboardsList from './components/DashboardsList';
import { ReportingAPI } from './library';
import reportingContext from './reportingContext';
import './styles/App.scss';


export default class App extends React.Component {

    constructor() {
        super();
        this.state = {
            token: null,
            //serverURL: "http://localhost:42002",
            serverURL: '',
            reportID: '',
            docTitle: '',
            documentType: '',
            visible: false,
        };

        this.toggleVisible = this.toggleVisible.bind(this);
        this.getInitialState = this.getInitialState.bind(this);
    }

    handleSubmit = (serverURL, token) => {
        let re = /\/$/;
        serverURL = serverURL.replace(re, "");
        this.setState({ ...this.state, token, serverURL });
    }

    handleLogout = () => {
        this.setState(this.getInitialState());
    }

    reportSelected = (reportID, docTitle, documentType) => {
        this.setState({
            ...this.state,
            reportID,
            docTitle,
            documentType,
            visible: !this.state.visible
        });
    }

    getInitialState = () => {
        return {
            token: null,
            serverURL: '',
            reportID: '',
            docTitle: '',
            documentType: '',
            visible: false,
        }
    }

    toggleVisible() {
        this.setState({
            visible: !this.state.visible
        });
    }

    render() {
        const reportingAPI = ReportingAPI(this.state.token, this.state.serverURL);

        const Application = (
            <div className="App">
                <reportingContext.Provider value={reportingAPI}>
                    <div>
                        <div className="topBar">
                            Company Name
                        </div>
                        <ReportsList reportSelected={this.reportSelected} />
                    </div>
                    <ReportsView reportID={this.state.reportID} toggleVisible={this.toggleVisible} panelVisibility={this.state.visible}
                        docTitle={this.state.docTitle} documentType={this.state.documentType} serverURL={this.state.serverURL} logout={this.handleLogout} />
                </reportingContext.Provider>
            </div>
        );

        return !this.state.token ? <Authorization handleSubmit={this.handleSubmit} /> : Application;
    }
}
