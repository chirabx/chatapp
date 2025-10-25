import React from 'react';
import { Trash2 } from 'lucide-react';

const ClearChatModal = ({
    isOpen,
    onClose,
    onConfirm,
    chatType = "私聊", // "私聊" 或 "群组"
    isLoading = false
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-base-100 rounded-lg p-6 max-w-md w-full mx-4">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-error/10 rounded-full">
                        <Trash2 className="size-6 text-error" />
                    </div>
                    <h3 className="text-lg font-semibold">清空聊天记录</h3>
                </div>

                <div className="mb-6">
                    <p className="text-base-content/70 mb-2">
                        确定要清空{chatType}的所有聊天记录吗？
                    </p>
                    <p className="text-sm text-error">
                        ⚠️ 此操作不可撤销，所有消息将被永久删除
                    </p>
                </div>

                <div className="flex gap-3 justify-end">
                    <button
                        onClick={onClose}
                        className="btn btn-ghost"
                        disabled={isLoading}
                    >
                        取消
                    </button>
                    <button
                        onClick={onConfirm}
                        className="btn btn-error"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <div className="loading loading-spinner loading-sm mr-2"></div>
                                清空中...
                            </>
                        ) : (
                            <>
                                <Trash2 className="size-4 mr-2" />
                                确认清空
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ClearChatModal;
