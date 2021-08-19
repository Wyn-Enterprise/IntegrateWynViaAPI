import * as React from "react";
import ParametersPanel from './ParametersPanel';
import "../styles/ReportsView.scss";

export default class ReportsView extends React.Component<any, any> {
    constructor(props) {
        super(props);
        this.state = {
            reportURL: null,
        };
    }

    viewDocument = (reportURL) => {
        this.setState({ reportURL })
    }

    public render() {
        const { reportID, docTitle, documentType, toggleVisible, panelVisibility, serverURL, logout } = this.props;
        const { reportURL } = this.state;

        return (
            <div className="reportsView">
                <ParametersPanel reportID={reportID} toggleVisible={toggleVisible} panelVisibility={panelVisibility} docTitle={docTitle} documentType={documentType} viewDocument={this.viewDocument} serverURL={serverURL} />
                <div className="viewer">
                    <div className="itemBar">
                        {docTitle}
                        <img src="/images/logout.svg" className="logoutImg" onClick={logout} title="Logout" />
                    </div>
                    <iframe className="report-preview" title="reportsView" src={reportURL ? `${serverURL}${reportURL}` : ''} />
                </div>
            </div>
        );
    }
}
