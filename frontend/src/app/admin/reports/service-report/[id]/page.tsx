// src/app/admin/reports/[id]/page.tsx
'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ServiceReport, Project } from '../../../../types';
import { getServiceReportById, getProjects } from '../../../../lib/api/data';

import dayjs from 'dayjs';
import 'dayjs/locale/th';
dayjs.locale('th');

// --- Define the UI-specific (Display) Service Report type ---
interface DisplayServiceReport {
    id: string;
    projectName: string;
    customerName: string;
    customerAddress: string;
    contactPerson: string;
    contactTel: string;
    serviceUnder: string;
    reportedBy: string;
    channel: string;
    statusOfWork: 'Completed' | 'Follow-up' | 'N/A';

    reportDetails: {
        date: string;
        description: string;
        problemCause: string;
        solutionAction: string;
    }[];

    reportByDate: string;
    remark: string;
    customerSignPath: string;

    serviceStaff: {
        engineerName: string;
        date: string;
        start: string;
        end: string;
        workingHours: string;
        travellingHours: string;
        charging: string;
    }[];
    approvedBy: string;

    companyNameFooter: string;
    companyAddressFooter: string;
    companyTelFooter: string;
    companyFaxFooter: string;
    companyWebsiteFooter: string;
}

// Helper for combining image URLs if they are relative
const combineImageUrl = (path: string): string => {
    if (path.startsWith('http://') || path.startsWith('https://')) {
        return path;
    }
    return `/uploads/${path}`;
};


export default function SingleReportPage() {
    const params = useParams();
    const router = useRouter();
    const idParam = params?.id;
    const id = Array.isArray(idParam) ? idParam[0] : idParam;

    const [displayReport, setDisplayReport] = useState<DisplayServiceReport | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id || typeof id !== 'string') {
            setError('Invalid report ID');
            setLoading(false);
            return;
        }

        const fetchData = async () => {
            try {
                const backendServiceReport: ServiceReport | undefined = await getServiceReportById(id);

                if (!backendServiceReport) {
                    throw new Error('Report not found');
                }

                const projectsData: Project[] = await getProjects();
                const relatedProject = projectsData.find(p => p.id === backendServiceReport.projectId);

                const transformedReport: DisplayServiceReport = {
                    id: backendServiceReport.id,
                    projectName: relatedProject?.name || 'N/A',
                    customerName: relatedProject?.customerName || 'N/A',
                    customerAddress: relatedProject?.customerAddress || 'N/A',
                    contactPerson: relatedProject?.contactPerson || 'N/A',
                    contactTel: relatedProject?.tel || 'N/A',
                    serviceUnder: relatedProject?.serviceUnder || 'N/A',

                    reportedBy: backendServiceReport.reportedBy || 'N/A',
                    channel: backendServiceReport.channel || 'N/A',
                    statusOfWork: backendServiceReport.status === 'Complete' ? 'Completed' : 'Follow-up',

                    reportDetails: [{
                        date: backendServiceReport.reportDate,
                        description: backendServiceReport.complain || 'N/A',
                        problemCause: backendServiceReport.causesOfFailure || 'N/A',
                        solutionAction: backendServiceReport.actionTaken || 'N/A',
                    }],

                    reportByDate: backendServiceReport.reportDate,
                    remark: '',
                    customerSignPath: '',

                    serviceStaff: [],
                    approvedBy: '',

                    companyNameFooter: "G INNOVATION CO.,LTD.",
                    companyAddressFooter: "238/5 Ratchadapisek Rd., kwang Huai khwang, Khet Huai khwang, Bangkok 10320",
                    companyTelFooter: "02-553-3138-40",
                    companyFaxFooter: "02-553-1027",
                    companyWebsiteFooter: "www.ginnovation.co.th",
                };

                setDisplayReport(transformedReport);

            } catch (err) {
                console.error('Fetch error:', err);
                setError(err instanceof Error ? err.message : 'Failed to load data');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    const formatTableDate = (dateString: string | Date): string => {
        if (!dateString) return '';
        const date = typeof dateString === 'string' ? dayjs(dateString) : dayjs(dateString);
        return date.isValid() ? date.format('DD/MM/YYYY') : '';
    };

    const formatTime = (timeString: string): string => {
        if (!timeString) return '';
        const [hours, minutes] = timeString.split(':');
        return `${hours}:${minutes}`;
    };

    const defaultCompanyName = "G INNOVATION CO.,LTD.";
    const defaultCompanyAddress = "238/5 Ratchadapisek Rd., kwang Huai khwang, Khet Huai khwang, Bangkok 10320";
    const defaultCompanyTel = "02-553-3138-40";
    const defaultCompanyFax = "02-553-1027";
    const defaultCompanyWebsite = "www.ginnovation.co.th";

    // Handle button clicks
    const handleBackClick = () => {
        router.back();
    };

    const handlePrintClick = () => {
        window.print();
    };


    if (loading) return (
        <div className="flex justify-center items-center h-screen bg-gray-100">
            <p className="text-lg text-gray-700">Loading report...</p>
        </div>
    );
    if (error) return (
        <div className="flex justify-center items-center h-screen bg-red-50">
            <p className="text-xl text-red-700">Error: {error}</p>
        </div>
    );
    if (!displayReport) return (
        <div className="flex justify-center items-center h-screen bg-gray-100">
            <p className="text-lg text-gray-700">No report data found for ID: {id}</p>
        </div>
    );

    return (
        <div className="p-4 bg-gray-100 min-h-screen font-sans">
            <div className="max-w-4xl mx-auto bg-white shadow-lg p-6 md:p-8 border border-gray-300 print-report-container"> {/* Added print-report-container class */}
                {/* Action Buttons Section */}
                <div className="flex justify-end gap-4 mb-4 print:hidden">
                    <button
                        onClick={handleBackClick}
                        className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                    >
                        &larr; กลับ
                    </button>
                    <button
                        onClick={handlePrintClick}
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    >
                        พิมพ์ PDF
                    </button>
                </div>

                {/* Header Section */}
                <div className="flex justify-between items-center border-b border-gray-300 pb-4 mb-6">
                    <div className="flex items-center">
                        <img
                            src='/images/g-logo.png'
                            alt="G Innovation Logo"
                            className="h-12 w-auto mr-4 object-contain"
                        />
                        <p className="text-lg font-bold text-gray-800">G Innovation Co.,Ltd.</p>
                    </div>
                    <h1 className="text-xl md:text-2xl font-bold text-gray-800">Service Report</h1>
                </div>

                {/* Customer Info Table */}
                <div className="mb-6 border border-black text-sm">
                    <div className="grid grid-cols-4 border-b border-black">
                        <div className="col-span-1 p-1.5 bg-gray-100 border-r border-black font-semibold">Project</div>
                        <div className="col-span-3 p-1.5 break-words whitespace-pre-wrap">{displayReport.projectName}</div>
                    </div>
                    <div className="grid grid-cols-4 border-b border-black">
                        <div className="col-span-1 p-1.5 bg-gray-100 border-r border-black font-semibold">Customer</div>
                        <div className="col-span-3 p-1.5 break-words whitespace-pre-wrap">{displayReport.customerName}</div>
                    </div>
                    <div className="grid grid-cols-4 border-b border-black">
                        <div className="col-span-1 p-1.5 bg-gray-100 border-r border-black font-semibold">Address</div>
                        <div className="col-span-3 p-1.5 break-words whitespace-pre-wrap">{displayReport.customerAddress}</div>
                    </div>
                    <div className="grid grid-cols-4 border-b border-black">
                        <div className="col-span-1 p-1.5 bg-gray-100 border-r border-black font-semibold">Contact Person</div>
                        <div className="col-span-3 p-1.5 break-words whitespace-pre-wrap">{displayReport.contactPerson}</div>
                    </div>
                    <div className="grid grid-cols-4 border-b border-black">
                        <div className="col-span-1 p-1.5 bg-gray-100 border-r border-black font-semibold">Contact Tel</div>
                        <div className="col-span-3 p-1.5 break-words whitespace-pre-wrap">{displayReport.contactTel}</div>
                    </div>
                    <div className="grid grid-cols-4">
                        <div className="col-span-1 p-1.5 bg-gray-100 border-r border-black font-semibold">Service under</div>
                        <div className="col-span-3 p-1.5 break-words whitespace-pre-wrap">{displayReport.serviceUnder}</div>
                    </div>
                </div>

                {/* Report Details Table */}
                <div className="mb-6 border border-black text-sm">
                    <div className="grid grid-cols-4 bg-gray-100 font-semibold text-center border-b border-black">
                        <div className="p-1.5 border-r border-black">วันที่</div>
                        <div className="p-1.5 border-r border-black">รายละเอียดที่แจ้ง</div>
                        <div className="p-1.5 border-r border-black">สาเหตุของปัญหา</div>
                        <div className="p-1.5">การแก้ไข/ดำเนินการ</div>
                    </div>
                    {displayReport.reportDetails && displayReport.reportDetails.length > 0 ? (
                        displayReport.reportDetails.map((detail, index) => (
                            <div key={index} className="grid grid-cols-4 border-b border-black last:border-b-0">
                                <div className="p-1.5 border-r border-black whitespace-nowrap">{formatTableDate(detail.date)}</div>
                                <div className="p-1.5 border-r border-black break-words whitespace-pre-wrap">{detail.description}</div>
                                <div className="p-1.5 border-r border-black break-words whitespace-pre-wrap">{detail.problemCause}</div>
                                <div className="p-1.5 break-words whitespace-pre-wrap">{detail.solutionAction}</div>
                            </div>
                        ))
                    ) : (
                        <div className="p-2 text-center text-gray-500">No report details available.</div>
                    )}
                </div>

                {/* Status of work & Signatures */}
                <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 text-sm">
                    <div className="border border-black">
                        <div className="p-1.5 bg-gray-100 font-semibold border-b border-black">Status of work</div>
                        <div className="p-2">
                            <div className="flex items-center mb-1">
                                <input
                                    type="checkbox"
                                    checked={displayReport.statusOfWork === 'Completed'}
                                    readOnly
                                    className="mr-2 h-4 w-4 text-blue-600 border-gray-300 rounded"
                                />
                                <label>Completed</label>
                            </div>
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={displayReport.statusOfWork === 'Follow-up'}
                                    readOnly
                                    className="mr-2 h-4 w-4 text-blue-600 border-gray-300 rounded"
                                />
                                <label>Follow-up</label>
                            </div>
                        </div>
                    </div>

                    <div className="border border-black">
                        <div className="grid grid-cols-3 border-b border-black">
                            <div className="col-span-1 p-1.5 bg-gray-100 border-r border-black font-semibold">Report by</div>
                            <div className="col-span-2 p-1.5 break-words whitespace-pre-wrap">{displayReport.reportedBy}</div>
                        </div>
                        <div className="grid grid-cols-3 border-b border-black">
                            <div className="col-span-1 p-1.5 bg-gray-100 border-r border-black font-semibold">Date</div>
                            <div className="col-span-2 p-1.5">{formatTableDate(displayReport.reportByDate)}</div>
                        </div>
                        <div className="grid grid-cols-3 border-b border-black">
                            <div className="col-span-1 p-1.5 bg-gray-100 border-r border-black font-semibold">Remark</div>
                            <div className="col-span-2 p-1.5 break-words whitespace-pre-wrap">{displayReport.remark}</div>
                        </div>
                        <div className="grid grid-cols-3 min-h-[60px] items-center">
                            <div className="col-span-1 p-1.5 bg-gray-100 border-r border-black font-semibold">Customer sign</div>
                            <div className="col-span-2 p-1.5">

                            </div>
                        </div>
                    </div>
                </div>

                {/* Service staff and working time */}
                <p className="font-bold mb-1 text-sm">Service staff and working time</p>
                <div className="mb-6 border border-black text-sm">
                    <div className="grid grid-cols-7 bg-gray-100 font-semibold text-center border-b border-black">
                        <div className="p-1.5 border-r border-black">Engineer name</div>
                        <div className="p-1.5 border-r border-black">Date</div>
                        <div className="p-1.5 border-r border-black">Start</div>
                        <div className="p-1.5 border-r border-black">End</div>
                        <div className="p-1.5 border-r border-black">Working hours</div>
                        <div className="p-1.5 border-r border-black">Travelling hours</div>
                        <div className="p-1.5">Charging</div>
                    </div>
                    {displayReport.serviceStaff && displayReport.serviceStaff.length > 0 ? (
                        displayReport.serviceStaff.map((staff, index) => (
                            <div key={index} className="grid grid-cols-7 border-b border-black last:border-b-0">
                                <div className="p-1.5 border-r border-black break-words whitespace-pre-wrap">{staff.engineerName}</div>
                                <div className="p-1.5 border-r border-black">{formatTableDate(staff.date)}</div>
                                <div className="p-1.5 border-r border-black">{formatTime(staff.start)}</div>
                                <div className="p-1.5 border-r border-black">{formatTime(staff.end)}</div>
                                <div className="p-1.5 border-r border-black">{staff.workingHours}</div>
                                <div className="p-1.5 border-r border-black">{staff.travellingHours}</div>
                                <div className="p-1.5">{staff.charging}</div>
                            </div>
                        ))
                    ) : (
                        <div className="p-2 text-center text-gray-500">No staff working time details available.</div>
                    )}
                    <div className="grid grid-cols-7 border-b border-black last:border-b-0">
                        <div className="col-span-5 p-1.5 text-right font-semibold border-r border-black">Approved by :</div>
                        <div className="col-span-2 p-1.5 break-words whitespace-pre-wrap">{displayReport.approvedBy}</div>
                    </div>
                </div>

                {/* Footer Section */}
                <div className="text-center text-xs text-gray-600 mt-8 border-t pt-4">
                    <p>{displayReport.companyNameFooter || defaultCompanyName}</p>
                    <p>{displayReport.companyAddressFooter || defaultCompanyAddress}</p>
                    <p>
                        Tel : {displayReport.companyTelFooter || defaultCompanyTel}{' '}
                        {displayReport.companyFaxFooter ? `Fax : ${displayReport.companyFaxFooter}` : (defaultCompanyFax ? `Fax : ${defaultCompanyFax}` : '')}
                    </p>
                    <p>{displayReport.companyWebsiteFooter || defaultCompanyWebsite}</p>
                </div>
            </div>
        </div>
    );
}