import React from 'react';
import { ArrowLeft, Users, Settings, UserPlus, Trash2 } from 'lucide-react';

const GroupSettingsSkeleton = () => {
    return (
        <div className="flex-1 flex flex-col bg-base-100">
            {/* 头部骨架 */}
            <div className="border-b border-base-300 p-4">
                <div className="flex items-center gap-3">
                    <div className="btn btn-ghost btn-sm">
                        <ArrowLeft className="size-4" />
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="size-10 bg-base-300 rounded-full animate-pulse"></div>
                        <div>
                            <div className="h-5 bg-base-300 rounded animate-pulse w-32 mb-2"></div>
                            <div className="h-4 bg-base-300 rounded animate-pulse w-20"></div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
                <div className="max-w-2xl mx-auto space-y-6">
                    {/* 群组信息设置骨架 */}
                    <div className="card bg-base-200">
                        <div className="card-body">
                            <div className="flex items-center gap-2 mb-4">
                                <Settings className="size-5" />
                                <div className="h-6 bg-base-300 rounded animate-pulse w-24"></div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <div className="h-4 bg-base-300 rounded animate-pulse w-16 mb-2"></div>
                                    <div className="h-10 bg-base-300 rounded animate-pulse w-full"></div>
                                </div>
                                <div>
                                    <div className="h-4 bg-base-300 rounded animate-pulse w-16 mb-2"></div>
                                    <div className="h-20 bg-base-300 rounded animate-pulse w-full"></div>
                                </div>
                            </div>

                            <div className="flex justify-end mt-4">
                                <div className="h-10 bg-base-300 rounded animate-pulse w-24"></div>
                            </div>
                        </div>
                    </div>

                    {/* 成员管理骨架 */}
                    <div className="card bg-base-200">
                        <div className="card-body">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <Users className="size-5" />
                                    <div className="h-6 bg-base-300 rounded animate-pulse w-20"></div>
                                </div>
                                <div className="h-8 bg-base-300 rounded animate-pulse w-24"></div>
                            </div>

                            {/* 成员列表骨架 */}
                            <div className="space-y-2">
                                {Array.from({ length: 3 }).map((_, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between p-3 bg-base-100 rounded-lg"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="size-10 bg-base-300 rounded-full animate-pulse"></div>
                                            <div>
                                                <div className="h-4 bg-base-300 rounded animate-pulse w-24 mb-1"></div>
                                                <div className="h-3 bg-base-300 rounded animate-pulse w-16"></div>
                                            </div>
                                        </div>
                                        <div className="h-8 w-8 bg-base-300 rounded-full animate-pulse"></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* 危险操作骨架 */}
                    <div className="card bg-error/10 border border-error/20">
                        <div className="card-body">
                            <div className="flex items-center gap-2 mb-4">
                                <Trash2 className="size-5" />
                                <div className="h-6 bg-base-300 rounded animate-pulse w-24"></div>
                            </div>
                            <div className="h-4 bg-base-300 rounded animate-pulse w-full mb-4"></div>
                            <div className="h-10 bg-base-300 rounded animate-pulse w-32"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GroupSettingsSkeleton;
