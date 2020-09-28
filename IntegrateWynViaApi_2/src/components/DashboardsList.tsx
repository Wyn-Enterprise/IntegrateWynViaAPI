import * as React from "react";
import reportingContext from '../reportingContext';
import "../styles/ReportsList.scss";

export default class DashboardsList extends React.Component<any, any> {
    static contextType = reportingContext;
    context!: React.ContextType<typeof reportingContext>;

    constructor(props) {
        super(props);
        this.state = {
            dashboardsList: [],
        };
    }

    componentDidMount() {
        this.context.getDashboardsList().then((value) => {            
            this.setState({ ...this.state, dashboardsList: value });
        }).catch(error => alert(error));
    }

    onClick = (id: string) => {
        //console.log(id);
        this.props.dashboardSelected(id);
    }

    public render() {
        const { dashboardsList } = this.state;

        return (
            <div className="reportsList">
                <span className="heading">Dashboards</span>
                {dashboardsList.map((dbd, index) => (
                    <div key={index} className="listItem" onClick={() => this.onClick(dbd.id)}>
                        <h3 title={dbd.title}>{dbd.title}</h3>
                    </div>
                ))}
            </div>
        );
    }
}
