'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getServiceReportById, getProjects } from '../../../../lib/data';
import { ServiceReport, Project } from '../../../../types'; // ตรวจสอบว่า 'ServiceReport' ใน types.ts ตรงกับโครงสร้าง API ใหม่

// กำหนด Type ของ ServiceReport ให้ตรงกับ API ใหม่
// คุณอาจจะต้องย้ายส่วนนี้ไปที่ไฟล์ types.ts ของคุณ

export default function SingleReportPage() {
    const params = useParams();
    const idParam = params?.id;
    const id = Array.isArray(idParam) ? idParam[0] : idParam;
    const [report, setReport] = useState<ServiceReport | null>(null); // เปลี่ยนเป็น APIServiceReport
    const [projects, setProjects] = useState<Project[]>([]);
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
                // ดึงข้อมูลรายงาน
                // สมมติว่า getServiceReportById คืนค่า APIServiceReport
                const reportData = await getServiceReportById(id);
                if (!reportData) {
                    throw new Error('Report not found');
                }
                setReport(reportData);

                // ดึงข้อมูลโปรเจกต์
                const projectsData = await getProjects();
                setProjects(projectsData);

            } catch (err) {
                console.error('Fetch error:', err);
                setError(err instanceof Error ? err.message : 'Failed to load data');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    if (loading) return <div className="p-4">Loading report...</div>;
    if (error) return <div className="p-4 text-red-500">Error: {error}</div>;
    if (!report) return <div className="p-4">No report data found</div>;

    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A'; // เพิ่มการจัดการถ้า dateString เป็นค่าว่าง
        return new Date(dateString).toLocaleString('th-TH');
    };

    // ค้นหาชื่อโปรเจกต์จากอาร์เรย์ projects
    const projectName = projects.find(p => p.id === report.projectId)?.name || report.projectId || 'N/A';

    return (
        <div className="p-4 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Service Report #{report.id.slice(-6)}</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-4 rounded-lg shadow">
                    <h2 className="text-lg font-semibold mb-4 border-b pb-2">Basic Information</h2>
                    <div className="space-y-3">
                        <div>
                            <p className="text-sm text-gray-500">Project</p>
                            <p>{projectName}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Reported By</p>
                            <p>{report.reportedBy || 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Channel</p>
                            <p>{report.channel || 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Report Date</p>
                            <p>{formatDate(report.reportDate)}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Status</p>
                            <p>{report.status || 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Created At</p>
                            <p>{formatDate(report.createdAt)}</p>
                        </div>

                    </div>
                </div>

                <div className="bg-white p-4 rounded-lg shadow">
                    <h2 className="text-lg font-semibold mb-4 border-b pb-2">Problem Details</h2>
                    <div className="space-y-3">
                        {report.causesOfFailure && (
                            <div>
                                <p className="text-sm text-gray-500">Report By</p>
                                <p>{report.reportedBy}</p>
                            </div>
                        )}
                        <div>
                            <p className="text-sm text-gray-500">Complain</p>
                            <p>{report.complain || 'N/A'}</p>
                        </div>

                        {report.causesOfFailure && (
                            <div>
                                <p className="text-sm text-gray-500">Causes of Failure</p>
                                <p>{report.causesOfFailure}</p>
                            </div>
                        )}
                        {report.actionTaken && (
                            <div>
                                <p className="text-sm text-gray-500">Action Taken</p>
                                <p>{report.actionTaken}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {report.imagePaths && report.imagePaths.length > 0 && (
                <div className="bg-white p-4 rounded-lg shadow mt-6">
                    <h2 className="text-lg font-semibold mb-4 border-b pb-2">Images</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {report.imagePaths.map((path, index) => (
                            <div key={index} className="flex justify-center items-center overflow-hidden rounded-lg border">
                                <img
                                    src={path}
                                    alt={`Report Image ${index + 1}`}
                                    className="w-full h-auto object-cover" // ใช้ object-cover เพื่อให้รูปภาพเต็มพื้นที่และรักษาสัดส่วน
                                />
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}