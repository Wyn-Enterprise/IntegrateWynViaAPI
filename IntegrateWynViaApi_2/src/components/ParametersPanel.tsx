import * as React from "react";
import DropdownButton from 'react-bootstrap/DropdownButton';
import Dropdown from 'react-bootstrap/Dropdown';
import InputGroup from 'react-bootstrap/InputGroup';
import FormControl from 'react-bootstrap/FormControl'
import reportingContext from '../reportingContext';
import { ReportingTypes } from '../library';
import "../styles/ParametersPanel.scss";
import Button from "react-bootstrap/Button";
import { DatasetReference } from "../library/types";

type ParametersPanelProps = {
    reportID: string,
    viewDocument: Function,
    docTitle: string,
    documentType: string,
    serverURL: string,
    toggleVisible: Function,
    panelVisibility: boolean
};
type ParametersPanelState = {
    reportInfo: ReportingTypes.ReportInfoResponse | null,
    dashboardInfo: ReportingTypes.DashboardInfoResponse | null,
    documentID: string | null,
    parameters: { [key: string]: Array<any> } | null,
    datasetInfo: ReportingTypes.DatasetInfoResponse | null
};
export default class ParametersPanel extends React.Component<ParametersPanelProps, ParametersPanelState> {
    static contextType = reportingContext;
    context!: React.ContextType<typeof reportingContext>;
    datasetValues: ReportingTypes.DatasetInfoResponse | null;

    constructor(props) {
        super(props);
        this.state = {
            reportInfo: null,
            dashboardInfo: null,
            documentID: null,
            parameters: null,
            datasetInfo: null,
        };

        this.datasetValues = null;

        this.isEmpty = this.isEmpty.bind(this);
        //this.getDatasetValues = this.getDatasetValues.bind(this);
    }

    isEmpty = function (obj) {
        for (var key in obj) {
            if (obj.hasOwnProperty(key))
                return false;
        }
        return true;
    }

    componentDidUpdate(prevProps) {
        const { reportID, documentType } = this.props;
        const { reportID: prevreportID } = prevProps;
        if (reportID === prevreportID) return;

        if (documentType === 'rdl') {
            reportID && this.context.getReportInfo(reportID).then((reportInfo) => {
                const parameters = reportInfo && reportInfo.parameters.reduce((params, p) => ({ ...params, [p.name]: p.defaultValue.values && p.defaultValue.values[0] }), {})
                this.setState({ ...this.state, reportInfo, parameters });
            }).catch(error => console.log(error));
        }
        else if (documentType === 'dbd') {
            reportID && this.context.getDashboardInfo(reportID).then((dashboardInfo) => {
                const parameters = dashboardInfo && dashboardInfo.parameters && dashboardInfo.parameters.reduce((params, p) => ({ ...params, [p.name]: p.defaultValue.values }), {});
                const datasetReference = (dashboardInfo && dashboardInfo.parameters && dashboardInfo.parameters.reduce((params, p) => ({ ...params, [p.name]: p.validValues && p.validValues.datasetReference }), {})) as DatasetReference;
                //console.log(this.isEmpty(datasetReference));
                !this.isEmpty(datasetReference) && this.context.getDashboardDatasetValues(datasetReference).then((datasetInfo) => {
                    this.setState({ ...this.state, datasetInfo });
                }).catch(error => console.log(error));
                //console.log(this.datasetValues);
                this.setState({ ...this.state, dashboardInfo, parameters, reportInfo: null, documentID: null });
            }).catch(error => console.log(error));
        }
    }

    exportReport = async (id: string, exportExtension: string) => {
        const { parameters } = this.state;
        const payloadParameters = parameters && Object.keys(parameters).reduce((params, param) => { parameters[param] && params.push({ key: param, value: parameters[param] }); return params; }, [] as Array<{ key: string, value: Array<any> }>);
        const renderPayload: ReportingTypes.RenderPayload = {
            interactiveActions: "",
            parameters: payloadParameters,
            settings: []
        }
        const resultUrl = await this.context.exportReport(id, exportExtension as ReportingTypes.ExportTypes, renderPayload);
        if (resultUrl) {
            const previewWindow = window.open(`${this.props.serverURL}${resultUrl}`, '_blank');
            if (previewWindow) previewWindow.focus();
        }
    }

    exportDocument = async (exportExtension: string) => {
        const renderPayload: ReportingTypes.RenderDocumentPayload = {
            interactiveActions: "",
            settings: []
        }
        if (this.state.documentID) {
            const documentURL = await this.context.exportDocument(this.state.documentID, exportExtension as ReportingTypes.ExportTypes, renderPayload);
            const previewWindow = window.open(`${this.props.serverURL}${documentURL}`, '_blank');
            if (previewWindow) previewWindow.focus();
        }
    }

    renderDocument = async (id: string) => {
        const { parameters, datasetInfo } = this.state;
        if (this.props.documentType === 'rdl') {
            const payloadParameters = parameters && Object.keys(parameters).reduce((params, param) => { parameters[param] && params.push({ key: param, value: parameters[param] }); return params; }, [] as Array<{ key: string, value: Array<any> }>);
            const renderPayload: ReportingTypes.RenderPayload = {
                interactiveActions: "",
                parameters: payloadParameters,
                settings: []
            }
            const { documentURL, documentID } = await this.context.renderDocument(id, "pdf", renderPayload);
            this.setState({ ...this.state, documentID });
            this.props.viewDocument(documentURL);
        }
        else if (this.props.documentType === 'dbd') {            
            const par = parameters && Object.keys(parameters).reduce((params, param) => {
                parameters && parameters[param] && parameters[param].toString() === "Overall" ? datasetInfo &&
                    params.push({
                        [param]: Object.values(datasetInfo)[0]["entries"].filter((x) => { return x !== "Overall" && x !== "" })
                    }) : params.push({ [param]: Object.values(parameters)[0] });                
                return params;
            }, [] as Array<{ [x: string]: any[] }>);
           
            this.context.viewDashboard(id, par).then((documentURL) => {                
                this.props.viewDocument(documentURL);
            });
        }
    }

    onParamChange = (paramName: string, value: Array<any>) => {

        this.setState({ ...this.state, parameters: { ...this.state.parameters, [paramName]: value } });
    }

    public render() {
        const { reportInfo, documentID, parameters, dashboardInfo, datasetInfo } = this.state;
        const { reportID, docTitle, documentType, panelVisibility } = this.props;

        var visibility = "hide";

        if (panelVisibility) {
            visibility = "show";
        }

        var paramEditors = Array();

        //Report
        if (documentType === "rdl") {
            paramEditors = ((reportInfo && reportInfo.parameters) || []).map((param, i) => {
                const defaultValue = parameters ? parameters[param.name] : param.defaultValue && param.defaultValue.values && param.defaultValue.values.length > 0 ? param.defaultValue.values : [];
                const availableValues = param.validValues && param.validValues.values && param.validValues.values.length > 0 ? param.validValues.values : [];
                return (<InputGroup key={i}>
                    <InputGroup.Prepend>
                        <InputGroup.Text>{param.name}</InputGroup.Text>
                    </InputGroup.Prepend>
                    <FormControl value={Array.isArray(defaultValue) ? defaultValue.join() : defaultValue || ""} aria-label={param.name} onChange={(e) => this.onParamChange(param.name, e.target.value.split(','))} />

                    {availableValues.length > 0 && <DropdownButton
                        as={InputGroup.Append}
                        variant="secondary"
                        title=""
                        id={`${i}`}
                        alignRight
                    >
                        {availableValues.map((v, i) => (<Dropdown.Item key={i} onClick={() => this.onParamChange(param.name, v.value.split(','))}>{v.label}</Dropdown.Item>))}
                    </DropdownButton>}
                </InputGroup>);
            });
        }
        //Dashboard
        else if (documentType === "dbd") {
            paramEditors = ((dashboardInfo && dashboardInfo.parameters) || []).map((param, i) => {
                const defaultValue = parameters ? parameters[param.name] : param.defaultValue && param.defaultValue.values && param.defaultValue.values.length > 0 ? param.defaultValue.values : [];
                const availableValues = param.validValues && param.validValues.values && param.validValues.values.length > 0 ? param.validValues.values : [];
                const datasetValues = datasetInfo && Object.keys(datasetInfo).length > 0 ? datasetInfo[0].entries : [];
                return (<InputGroup key={i}>
                    <InputGroup.Prepend>
                        <InputGroup.Text>{param.name}</InputGroup.Text>
                    </InputGroup.Prepend>
                    <FormControl value={Array.isArray(defaultValue) ? defaultValue.join() : defaultValue || ""} aria-label={param.name} onChange={(e) => this.onParamChange(param.name, e.target.value.split(','))} />

                    {availableValues.length > 0 && <DropdownButton
                        as={InputGroup.Append}
                        variant="secondary"
                        title=""
                        id={`${i}`}
                        alignRight
                    >
                        {availableValues.map((v, i) => (<Dropdown.Item key={i} onClick={() => this.onParamChange(param.name, v.value.split(','))}>{v.label}</Dropdown.Item>))}
                    </DropdownButton>}

                    {datasetValues.length > 0 && <DropdownButton
                        as={InputGroup.Append}
                        variant="secondary"
                        title=""
                        id={`${i}`}
                        alignRight
                    >
                        {datasetValues.map((v, i) => (<Dropdown.Item key={i} onClick={() => this.onParamChange(param.name, v)}>{v}</Dropdown.Item>))}
                    </DropdownButton>}
                </InputGroup>);
            });
        }
        return (<div id="parametersPanel" className={visibility}>
            <div className="panelHeader">
                <div className="backBtn" onClick={() => this.props.toggleVisible()}></div>
                <span>{docTitle}</span>
            </div>
            {paramEditors}
            <div className="toolbox">
                <Button key="preview" title="Preview document" className="btnRun" disabled={!reportID} onClick={() => this.renderDocument(reportID)}>Run</Button>
            </div>
            <div className="toolboxExport">
                <DropdownButton id="dropdown-export" title="Save as" size="sm" disabled={!documentID}>
                    {['Excel', 'Image', 'Html', 'Pdf', 'Csv', 'Json', 'Docx'].map((l, i) => (<Dropdown.Item key={i} onClick={() => this.exportDocument(l.toLowerCase())}>{l}</Dropdown.Item>))}
                </DropdownButton>
                <DropdownButton id="dropdown-export" title="Export" size="sm" disabled={!reportInfo}>
                    {['Excel', 'Image', 'Html', 'Pdf', 'Csv', 'Json', 'Docx'].map((l, i) => (<Dropdown.Item key={i} onClick={() => this.exportReport(reportID, l.toLowerCase())}>{l}</Dropdown.Item>))}
                </DropdownButton>
            </div>
        </div>)
    }
}
