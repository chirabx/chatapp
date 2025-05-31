import { useState } from 'react';
import { Download, Calendar, X } from 'lucide-react';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { axiosInstance } from '../lib/axios';
import toast from 'react-hot-toast';

const BotExport = ({ isOpen, onClose }) => {
    const [isExporting, setIsExporting] = useState(false);
    const [exportOptions, setExportOptions] = useState({
        format: 'json',
        startDate: '',
        endDate: '',
        includeMetadata: false
    });

    const handleExport = async () => {
        try {
            setIsExporting(true);

            const params = new URLSearchParams();
            Object.entries(exportOptions).forEach(([key, value]) => {
                if (value) params.append(key, value);
            });

            const response = await axiosInstance.get(`/bot/export?${params}`, {
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;

            const filename = `bot-conversations-${format(new Date(), 'yyyyMMdd')}.${exportOptions.format}`;
            link.setAttribute('download', filename);

            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            toast.success('导出成功');
            onClose(); // 导出成功后关闭弹窗
        } catch (error) {
            console.error('导出失败:', error);
            toast.error('导出失败');
        } finally {
            setIsExporting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-base-100 rounded-lg w-full max-w-md p-6 relative">
                {/* 关闭按钮 */}
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 btn btn-ghost btn-circle btn-sm"
                >
                    <X size={20} />
                </button>

                <h3 className="text-lg font-semibold mb-4">导出对话记录</h3>

                <div className="space-y-4">
                    {/* 导出格式选择 */}
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text">导出格式</span>
                        </label>
                        <select
                            className="select select-bordered w-full"
                            value={exportOptions.format}
                            onChange={(e) => setExportOptions(prev => ({
                                ...prev,
                                format: e.target.value
                            }))}
                        >
                            <option value="json">JSON</option>
                            <option value="csv">CSV</option>
                            <option value="pdf">PDF</option>
                        </select>
                    </div>

                    {/* 日期范围选择 */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">开始日期</span>
                            </label>
                            <input
                                type="date"
                                className="input input-bordered"
                                value={exportOptions.startDate}
                                onChange={(e) => setExportOptions(prev => ({
                                    ...prev,
                                    startDate: e.target.value
                                }))}
                            />
                        </div>
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">结束日期</span>
                            </label>
                            <input
                                type="date"
                                className="input input-bordered"
                                value={exportOptions.endDate}
                                onChange={(e) => setExportOptions(prev => ({
                                    ...prev,
                                    endDate: e.target.value
                                }))}
                            />
                        </div>
                    </div>

                    {/* 元数据选项 */}
                    <div className="form-control">
                        <label className="label cursor-pointer">
                            <span className="label-text">包含元数据</span>
                            <input
                                type="checkbox"
                                className="toggle toggle-primary"
                                checked={exportOptions.includeMetadata}
                                onChange={(e) => setExportOptions(prev => ({
                                    ...prev,
                                    includeMetadata: e.target.checked
                                }))}
                            />
                        </label>
                    </div>

                    {/* 导出按钮 */}
                    <button
                        className="btn btn-primary w-full"
                        onClick={handleExport}
                        disabled={isExporting}
                    >
                        {isExporting ? (
                            <span className="loading loading-spinner"></span>
                        ) : (
                            <>
                                <Download className="w-4 h-4 mr-2" />
                                导出对话记录
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BotExport; 