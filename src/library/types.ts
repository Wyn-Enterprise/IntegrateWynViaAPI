export type RenderPayload = {
    interactiveActions?: string | null,
    parameters?: Array<{ key: string, value: Array<any> }> | null,
    settings?: Array<{ key: string, value: string }> | null,
}

export type RenderDocumentPayload = {
    interactiveActions?: string | null,
    settings?: Array<{ key: string, value: string }> | null,
}

export type DatasetInfoResponse = {
    columnId: string;
    subColumnType: number,
    "entries": Array<string>
}

export type DatasetReference = {
    datasetId: string,
    valueField: string
}

export type DashboardParameterDescription = {
    name: string;
    prompt: string;
    dataType: string;
    //selectAllValue: string;
    //allowBlank: boolean;
    nullable: boolean;
    multiValue: boolean;
    multiline: boolean;
    hidden: boolean;
    usedInQuery: string;
    dependsOn: string[];
    dateOnly: boolean;
    validValues: {
        datasetReference: DatasetReference,
        values: Array<{ label: string, value: string }>
    };
    defaultValue: { values: Array<string> };
}

export type DashboardInfoResponse = {
    //name: string;
    //sizeType: string;
    //displayType: string;
    parameters: DashboardParameterDescription[];
}

export type ParameterDescription = {
    name: string;
    prompt: string;
    dataType: string;
    selectAllValue: string;
    allowBlank: boolean;
    nullable: boolean;
    multiValue: boolean;
    multiline: boolean;
    hidden: boolean;
    usedInQuery: string;
    dependsOn: string[];
    dateOnly: boolean;
    validValues: { values: Array<{ label: string, value: string }> };
    defaultValue: { values: Array<string> };
}

export type ReportInfoResponse = {
    name: string;
    sizeType: string;
    displayType: string;
    parameters: ParameterDescription[];
}

export type ExportTypes = 'excel' | 'image' | 'html' | 'pdf' | 'csv' | 'json' | 'docx';

type responseError = { message: string, workerException: string, errorCode: string };

export type ResponseJobStatus = {
    data: {
        job: {
            status: 'RUNNING' | 'SUCCESS' | 'ERROR',
            documentId: string,
            error: string,
        }
    },
    errors: responseError[],
}

export type ReportingAPI = {
    getReportsList: () => Promise<any>;
    getDashboardsList: () => Promise<any>;
    exportReport: (id: string, exportExtension: ExportTypes, renderPayload: RenderPayload) => Promise<string>;
    exportDocument: (id: string, exportExtension: ExportTypes, renderPayload: RenderDocumentPayload) => Promise<void>;
    viewDashboard: (id: string, parameters: any) => Promise<any>;
    renderDocument: (id: string, exportExtension: ExportTypes, renderPayload: RenderPayload) => Promise<{ documentID: string, documentURL: string }>;
    getReportInfo: (id: string) => Promise<ReportInfoResponse | null>;
    getDashboardInfo: (id: string) => Promise<DashboardInfoResponse | null>;
    getDashboardDatasetValues: (datasetReference: DatasetReference) => Promise<DatasetInfoResponse | null>;
}