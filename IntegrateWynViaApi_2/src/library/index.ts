import * as ReportingTypes from './types';
import httpHelper from "./httpHelper";

export async function GetAccessToken(url, user, password) {
    let re = /\/$/;
    url = url.replace(re, "");
    const endpoint = `${url}/connect/token`;

    const resolveResponse = async (response) => {
        const jsonResponse = await response.json();
        if (jsonResponse.error) return null;
        return jsonResponse.access_token;
    }

    return await fetch(endpoint, {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Accept: '*/*',
        },
        method: 'post',
        body: `grant_type=password&username=${user}&password=${password}&client_id=integration&client_secret=eunGKas3Pqd6FMwx9eUpdS7xmz`,
    }).then(await resolveResponse).catch(error => {
        alert(error);
        return null;
    });
}

const getReportsList = (token: string, serverURL: string) => async () => {
    const graphQuery = {
        query: 'query { documenttypes(key:"dbd,rdl") { documents{ id, title, type } } }'
    };

    const response = await httpHelper.postJson(`${serverURL}/api/graphql?token=${token}`, graphQuery);

    if (response && response.requestError) {
        alert(response && response.requestError);
        return;
    }

    const { data: { documenttypes } } = response;
    let allDocuments = documenttypes[0].documents.concat(documenttypes[1].documents);

    return allDocuments;
}

const getDashboardsList = (token: string, serverURL: string) => async () => {
    const graphQuery = {
        query: 'query { documenttypes(key:"dbd") { documents{ id, title } } }'
    };

    const response = await httpHelper.postJson(`${serverURL}/api/graphql?token=${token}`, graphQuery);

    if (response && response.requestError) {
        alert(response && response.requestError);
        return;
    }

    const { data: { documenttypes } } = response;
    return documenttypes[0].documents;
}

const exportReport = (token: string, serverURL: string) => async (id: string, exportExtension: string, renderPayload: ReportingTypes.RenderPayload) => {
    const renderPayloadString = JSON.stringify(renderPayload).replace(/"([^(")"]+)":/g, "$1:");
    const graphQuery = {
        query: `mutation { exportReport(reportId: "${id}", exportExtension: "${exportExtension}", renderPayload: ${renderPayloadString}) { resultUrl, verificationUrl } }`
    };

    const response = await httpHelper.postJson(`${serverURL}/api/graphql?token=${token}`, graphQuery);

    if (response && response.errors) {
        alert(response && response.errors[0] && response.errors[0].message);
        return;
    }

    const { data: { exportReport: { resultUrl } } } = response;
    return resultUrl;
}

const exportDocument = (token: string, serverURL: string) => async (id: string, exportExtension: string, renderPayload: ReportingTypes.RenderPayload) => {
    const renderPayloadString = JSON.stringify(renderPayload).replace(/"([^(")"]+)":/g, "$1:");
    const graphQuery = {
        query: `mutation { exportDocument(documentId: "${id}", exportExtension: "${exportExtension}", renderPayload: ${renderPayloadString}) { resultUrl, verificationUrl } }`
    };

    const response = await httpHelper.postJson(`${serverURL}/api/graphql?token=${token}`, graphQuery);

    if (response && response.errors) {
        alert(response && response.errors[0] && response.errors[0].message);
        return;
    }

    const { data: { exportDocument: { resultUrl } } } = response;
    return resultUrl;
}

const getReportInfo = (token: string, serverURL: string) => async (id: string): Promise<ReportingTypes.ReportInfoResponse | null> => {
    const graphQuery = {
        query: `query { reportInfo(reportId: "${id}") { name, parameters { name, validValues { values { label, value } } defaultValue { values }} } }`
    };

    const response = await httpHelper.postJson(`${serverURL}/api/graphql?token=${token}`, graphQuery);
    if (response && response.errors) {
        alert(response && response.errors[0] && response.errors[0].message);
        return null;
    }

    const { data: { reportInfo } } = response;

    return reportInfo as ReportingTypes.ReportInfoResponse;
}

const getDashboardInfo = (token: string, serverURL: string) => async (id: string): Promise<ReportingTypes.DashboardInfoResponse | null> => {
    const graphQuery = {
        query: `query { document(id: "${id}") { ... on Dashboard { parameters { name, prompt, hidden, dataType, dateOnly, multiValue, validValues { datasetReference{ datasetId, valueField }, values { label, value } }, defaultValue { values } } } } }`
    };

    const response = await httpHelper.postJson(`${serverURL}/api/graphql?token=${token}`, graphQuery);
    if ((response && response.errors) || (response.data.document.parameters && response.data.document.parameters.length === 0)) {
        return null;
    }

    const { data: { document } } = response;

    return document as ReportingTypes.DashboardInfoResponse;
}

const getDashboardDatasetValues = (token: string, serverURL: string) => async (datasetReference: ReportingTypes.DatasetReference): Promise<ReportingTypes.DatasetInfoResponse | null> => {

    for (var p in datasetReference) {
        if (p && datasetReference.hasOwnProperty(p)) {
            const queryData = [{ "columnId": `${datasetReference[p].valueField}` }];

            const response = await httpHelper.postJson(`${serverURL}/api/pivot/datasets/${datasetReference[p].datasetId}/column-entries?token=${token}`, queryData);

            if (response && response.requestError) {
                return null;
            }
            return response as ReportingTypes.DatasetInfoResponse;
        }
    }

    return null;
}

const viewDashboard = (token: string, serverURL: string) => async (id: string, parameters: { [key: string]: Array<any> }) => {

    var url = `/dashboards/view/${id}?token=${token}`;
    let dp = "";

    if (parameters && Object.keys(parameters) != null) {
        dp = "&dp={";
        var params = Object.values(parameters).reduce((k, v) => { return v });
        Object.entries(params).map(([key, val]) => {
            dp += Array.isArray(val) ? `"${key}":[${val.map(p => `"${p}"`).join(',')}],` : `"${key}":["${val}"],`;
        });
        dp = dp.slice(0, -1) + "}";

        return url + dp;
    }
    else
        return url;
}

const renderDocument = (token: string, serverURL: string) => async (reportID: string, exportExtension: string, renderPayload: ReportingTypes.RenderPayload) => {
    const getJobID = async (id) => {
        const renderPayloadString = JSON.stringify(renderPayload).replace(/"([^(")"]+)":/g, "$1:");
        const graphQuery = {
            query: `mutation { render(reportId: "${id}", renderPayload: ${renderPayloadString}) { jobId } }`
        };

        const response = await httpHelper.postJson(`${serverURL}/api/graphql?token=${token}`, graphQuery);

        if (response && response.errors) {
            alert(response && response.errors[0] && response.errors[0].message);
            return;
        }

        const { data: { render: { jobId } } } = response;
        return jobId;
    }

    const getDocumentID = async (id) => {
        const graphQuery = {
            query: `query { job(jobId: "${id}") { status, documentId, error } }`
        };

        const response: ReportingTypes.ResponseJobStatus = await httpHelper.postJson(`${serverURL}/api/graphql?token=${token}`, graphQuery);
        if (response && response.errors) {
            alert(response && response.errors[0] && response.errors[0].message);
            return null;
        }

        const { data: { job: { status, documentId, error } } } = response;
        if (status === "ERROR") {
            alert(error);
            return null;
        }

        if (status === "RUNNING") {
            return getDocumentID(id);
        }

        return documentId;
    }

    const jobID = await getJobID(reportID);
    const documentID = await getDocumentID(jobID);

    if (!documentID) return { documentID: null, documentURL: null };

    let renderDocumentPayload: ReportingTypes.RenderDocumentPayload = {
        interactiveActions: renderPayload.interactiveActions,
        settings: renderPayload.settings,
    };
    // override Print option, for disabling Content-Disposition as attachment
    renderDocumentPayload && renderDocumentPayload.settings && renderDocumentPayload.settings.push({ key: 'Print', value: 'true' });
    const documentURL = await exportDocument(token, serverURL)(documentID, exportExtension, renderDocumentPayload);

    return { documentID, documentURL };
}

export const ReportingAPI = (token, serverURL): ReportingTypes.ReportingAPI => ({
    getReportsList: getReportsList(token, serverURL),
    getDashboardsList: getDashboardsList(token, serverURL),
    exportReport: exportReport(token, serverURL),
    exportDocument: exportDocument(token, serverURL),
    viewDashboard: viewDashboard(token, serverURL),
    getReportInfo: getReportInfo(token, serverURL),
    getDashboardInfo: getDashboardInfo(token, serverURL),
    getDashboardDatasetValues: getDashboardDatasetValues(token, serverURL),
    renderDocument: renderDocument(token, serverURL)
});

export { ReportingTypes };
