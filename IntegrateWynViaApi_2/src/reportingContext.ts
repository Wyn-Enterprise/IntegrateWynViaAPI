import React from 'react';
import { ReportingTypes } from './library';
import { DatasetReference } from './library/types';

//Is stub of reporting API, will be overridden in App component
export default React.createContext<ReportingTypes.ReportingAPI>({
    exportReport: (id: string, exportExtension: string, renderPayload: ReportingTypes.RenderPayload) => new Promise(() => { }),
    getReportInfo: () => new Promise(() => { }),
    getDashboardInfo: () => new Promise(() => { }),
    getReportsList: () => new Promise(() => { }),
    getDashboardsList: () => new Promise(() => { }),
    getDashboardDatasetValues: (datasetReference: DatasetReference) => new Promise(() => { }),
    exportDocument: (id: string, exportExtension: string, renderPayload: ReportingTypes.RenderPayload) => new Promise(() => { }),
    viewDashboard: (id: string, parameters: any) => new Promise(() => { }),
    renderDocument: (id: string, exportExtension: string, renderPayload: ReportingTypes.RenderPayload) => new Promise(() => { }),
});