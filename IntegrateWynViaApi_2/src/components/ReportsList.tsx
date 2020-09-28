import * as React from "react";
import reportingContext from '../reportingContext';
import "../styles/ReportsList.scss";

export default class ReportsList extends React.Component<any, any> {
    static contextType = reportingContext;
    context!: React.ContextType<typeof reportingContext>;

    constructor(props) {
        super(props);
        this.state = {
            reportsList: [],
            reportID: "",
        };
    }

    componentDidMount() {
        this.context.getReportsList().then((value) => {
            this.setState({ ...this.state, reportsList: value });
        }).catch(error => alert(error));
    }

    onClick = (id: string, title: string, type: string) => {
        this.props.reportSelected(id, title, type);
    }

    public render() {
        const { reportsList } = this.state;
        //const { reportID, documentType, serverURL } = this.props;

        const dash = "dbd";
        const dbdIconSrc = "images/dashboard.svg";
        const rptIconSrc = "images/report.svg";

        return (
            <div className="reportsList">
                {reportsList.map((rpt, index) => (
                    <div key={index} className="listItem" onClick={() => this.onClick(rpt.id, rpt.title, rpt.type)}>
                        <img src={rpt.type === dash ? dbdIconSrc : rptIconSrc} alt={rpt.type} />
                        <h3 title={rpt.title}>{rpt.title}</h3>
                    </div>
                ))}
            </div>
        );
    }
}
