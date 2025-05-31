import { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Image, Eraser, RefreshCw, HelpCircle, Lightbulb, X, Download, Upload } from 'lucide-react';
import { axiosInstance } from '../../lib/axios.js';
import { toast } from 'react-hot-toast';

const ImageRecognition = ({ onBack }) => {
    const [isDrawing, setIsDrawing] = useState(false);
    const [showHelp, setShowHelp] = useState(false);
    const [showKnowledge, setShowKnowledge] = useState(false);
    const [showGuide, setShowGuide] = useState(true);
    const [brushSize, setBrushSize] = useState(10);
    const [isErasing, setIsErasing] = useState(false);
    const [prediction, setPrediction] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [history, setHistory] = useState([]);

    const canvasRef = useRef(null);
    const contextRef = useRef(null);

    // 初始化画布
    useEffect(() => {
        const canvas = canvasRef.current;
        canvas.width = 280;
        canvas.height = 280;
        canvas.style.width = '280px';
        canvas.style.height = '280px';

        const context = canvas.getContext('2d');
        context.lineCap = 'round';
        context.lineJoin = 'round';
        context.strokeStyle = '#000000';
        context.lineWidth = brushSize;
        contextRef.current = context;

        // 设置白色背景
        context.fillStyle = '#FFFFFF';
        context.fillRect(0, 0, canvas.width, canvas.height);
    }, []);

    // 开始绘画
    const startDrawing = ({ nativeEvent }) => {
        const { offsetX, offsetY } = nativeEvent;
        contextRef.current.beginPath();
        contextRef.current.moveTo(offsetX, offsetY);
        setIsDrawing(true);
    };

    // 绘画过程
    const draw = ({ nativeEvent }) => {
        if (!isDrawing) return;
        const { offsetX, offsetY } = nativeEvent;
        contextRef.current.lineTo(offsetX, offsetY);
        contextRef.current.stroke();
    };

    // 结束绘画
    const finishDrawing = () => {
        contextRef.current.closePath();
        setIsDrawing(false);
    };

    // 清除画布
    const clearCanvas = () => {
        const canvas = canvasRef.current;
        const context = contextRef.current;
        context.fillStyle = '#FFFFFF';
        context.fillRect(0, 0, canvas.width, canvas.height);
        setPrediction(null);
    };

    // 切换橡皮擦
    const toggleEraser = () => {
        setIsErasing(!isErasing);
        contextRef.current.strokeStyle = isErasing ? '#000000' : '#FFFFFF';
    };

    // 调整画笔大小
    const changeBrushSize = (size) => {
        setBrushSize(size);
        contextRef.current.lineWidth = size;
    };

    // 保存图片
    const saveImage = () => {
        const canvas = canvasRef.current;
        const link = document.createElement('a');
        link.download = 'ai-drawing.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
    };

    // 上传图片
    const uploadImage = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        // 检查文件类型
        if (!file.type.startsWith('image/')) {
            toast.error('请上传图片文件');
            return;
        }

        // 检查文件大小（限制为5MB）
        if (file.size > 5 * 1024 * 1024) {
            toast.error('图片大小不能超过5MB');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const canvas = canvasRef.current;
            const context = contextRef.current;

            // 创建图片对象
            const img = document.createElement('img');
            img.onload = () => {
                // 清除画布
                context.fillStyle = '#FFFFFF';
                context.fillRect(0, 0, canvas.width, canvas.height);

                // 计算图片缩放比例，保持宽高比
                const scale = Math.min(
                    canvas.width / img.width,
                    canvas.height / img.height
                );

                // 计算居中位置
                const x = (canvas.width - img.width * scale) / 2;
                const y = (canvas.height - img.height * scale) / 2;

                // 绘制图片
                context.drawImage(
                    img,
                    x, y,
                    img.width * scale,
                    img.height * scale
                );

                // 自动开始识别
                recognizeImage();
            };
            img.onerror = () => {
                toast.error('图片加载失败，请重试');
            };
            img.src = e.target.result;
        };
        reader.onerror = () => {
            toast.error('图片读取失败，请重试');
        };
        reader.readAsDataURL(file);
    };

    // 识别图片
    const recognizeImage = async () => {
        if (!canvasRef.current) return;

        setIsLoading(true);
        try {
            // 获取画布数据
            const canvas = canvasRef.current;
            const imageData = canvas.toDataURL('image/png');

            // 调用后端 API 进行图像识别
            const response = await axiosInstance.post('/api/games/image-recognition', {
                image: imageData
            });

            if (response.data.success) {
                const { prediction } = response.data;
                setPrediction(prediction);
                setHistory(prev => [{
                    image: imageData,
                    prediction,
                    timestamp: new Date().toLocaleString()
                }, ...prev]);
            } else {
                throw new Error(response.data.error || '识别失败');
            }
        } catch (error) {
            console.error('识别失败:', error);
            toast.error(error.response?.data?.error || error.message || '识别失败，请重试');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-4 w-full max-w-2xl mx-auto">
            {/* 返回按钮和游戏标题 */}
            <div className="animate-fade-in">
                <button
                    onClick={onBack}
                    className="btn btn-ghost btn-sm gap-2 mb-4 transition-all hover:translate-x-[-4px]"
                >
                    <ArrowLeft className="w-4 h-4" />
                    返回游戏列表
                </button>

                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                        <div className="relative">
                            <Image className="w-5 h-5 text-primary animate-bounce-subtle" />
                        </div>
                        AI 图像识别挑战
                    </h2>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setShowHelp(!showHelp)}
                            className="btn btn-ghost btn-sm tooltip tooltip-left transition-all hover:scale-110"
                            data-tip="游戏说明"
                        >
                            <HelpCircle className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setShowKnowledge(true)}
                            className="btn btn-ghost btn-sm tooltip tooltip-left transition-all hover:scale-110"
                            data-tip="AI 知识点"
                        >
                            <Lightbulb className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* 引导提示弹窗 */}
            {showGuide && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
                    <div className="bg-base-100 rounded-lg p-6 max-w-lg w-full mx-4 relative animate-slide-up">
                        <button
                            onClick={onBack}
                            className="btn btn-ghost btn-sm gap-2 absolute top-4 left-4 transition-all hover:translate-x-[-4px]"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            返回游戏列表
                        </button>

                        <div className="flex items-start gap-4 mt-8">
                            <div className="bg-primary/20 p-3 rounded-full animate-pulse-subtle">
                                <Image className="w-6 h-6 text-primary" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold mb-3 animate-slide-right">欢迎来到 AI 图像识别挑战！</h3>
                                <p className="text-base-content/80 mb-6 animate-slide-right animation-delay-200">
                                    在这个游戏中，你可以画图让 AI 来识别。
                                    通过这个游戏，你可以了解 AI 是如何"看到"和"理解"图像的。
                                    试着画一些简单的物体，看看 AI 能否正确识别！
                                </p>
                                <div className="flex justify-end animate-slide-up animation-delay-300">
                                    <button
                                        onClick={() => setShowGuide(false)}
                                        className="btn btn-primary gap-2 transition-all hover:scale-105 hover:shadow-lg"
                                    >
                                        <Image className="w-4 h-4" />
                                        开始绘画
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 帮助信息 */}
            {showHelp && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
                    <div className="bg-base-100 rounded-lg p-6 max-w-lg w-full mx-4 animate-slide-up">
                        <div className="flex items-start justify-between mb-4">
                            <h3 className="text-lg font-semibold">游戏说明</h3>
                            <button
                                onClick={() => setShowHelp(false)}
                                className="btn btn-ghost btn-sm btn-circle"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <ul className="list-disc list-inside space-y-2 text-sm">
                            <li>在画布上绘制简单的物体或图案</li>
                            <li>可以使用画笔和橡皮擦工具</li>
                            <li>调整画笔大小以获得更好的绘画效果</li>
                            <li>点击"识别"按钮让 AI 猜测你画的是什么</li>
                            <li>可以保存你的作品或上传图片进行识别</li>
                        </ul>
                        <div className="flex justify-end mt-6">
                            <button
                                onClick={() => setShowHelp(false)}
                                className="btn btn-primary btn-sm"
                            >
                                明白了
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 知识点讲解弹窗 */}
            {showKnowledge && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
                    <div className="bg-base-100 rounded-lg p-6 max-w-lg w-full mx-4 animate-slide-up">
                        <div className="flex items-start justify-between mb-4">
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                <Lightbulb className="w-5 h-5 text-primary" />
                                AI 图像识别知识点
                            </h3>
                            <button
                                onClick={() => setShowKnowledge(false)}
                                className="btn btn-ghost btn-sm btn-circle"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <h4 className="font-medium mb-2">1. 什么是图像识别？</h4>
                                <p className="text-sm text-base-content/80">
                                    图像识别就像给电脑装上"眼睛"和"大脑"，让它能够像人类一样"看到"和"理解"图片。
                                    比如，当你看到一张猫的图片时，你马上就能认出这是一只猫。图像识别技术就是让电脑也能做到这一点！
                                </p>
                            </div>
                            <div>
                                <h4 className="font-medium mb-2">2. 图像识别是如何工作的？</h4>
                                <p className="text-sm text-base-content/80">
                                    想象一下你在学习认识动物：
                                    1. 老师给你看很多动物的图片
                                    2. 告诉你每张图片是什么动物
                                    3. 你慢慢学会分辨不同的动物

                                    电脑也是这样学习的！通过看大量的图片，它学会了识别各种物体。
                                </p>
                            </div>
                            <div>
                                <h4 className="font-medium mb-2">3. 生活中的图像识别</h4>
                                <p className="text-sm text-base-content/80">
                                    图像识别技术在我们的生活中随处可见：
                                    - 手机相册可以自动识别照片中的人脸
                                    - 扫一扫就能识别植物和动物
                                    - 自动驾驶汽车可以识别路标和行人
                                    - 智能门锁可以识别人脸来开门
                                </p>
                            </div>
                            <div>
                                <h4 className="font-medium mb-2">4. 有趣的实验</h4>
                                <p className="text-sm text-base-content/80">
                                    你可以试试：
                                    - 画一些简单的图形，看看AI能否认出
                                    - 画同一个物体的不同角度，观察识别结果
                                    - 画一些抽象的画，看看AI会怎么理解

                                    通过这个游戏，你可以更好地理解AI是如何"看"世界的！
                                </p>
                            </div>
                            <div className="flex justify-end gap-2 mt-6">
                                <button
                                    onClick={() => setShowKnowledge(false)}
                                    className="btn btn-primary btn-sm"
                                >
                                    明白了
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 主要内容 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 左侧：画布区域 */}
                <div className="space-y-4">
                    <div className="bg-base-100 rounded-lg p-4 shadow-sm">
                        <div className="flex flex-col gap-4">
                            {/* 工具按钮 */}
                            <div className="flex justify-between items-center">
                                <div className="flex gap-2">
                                    <button
                                        onClick={clearCanvas}
                                        className="btn btn-ghost btn-sm gap-2 transition-all hover:scale-105"
                                    >
                                        <RefreshCw className="w-4 h-4" />
                                        清除
                                    </button>
                                    <button
                                        onClick={toggleEraser}
                                        className={`btn btn-sm gap-2 transition-all hover:scale-105 ${isErasing ? 'btn-primary' : 'btn-ghost'}`}
                                    >
                                        <Eraser className="w-4 h-4" />
                                        橡皮擦
                                    </button>
                                </div>
                            </div>

                            {/* 画笔大小控制 */}
                            <div className="flex items-center gap-2">
                                <span className="text-sm whitespace-nowrap">画笔大小</span>
                                <input
                                    type="range"
                                    min="1"
                                    max="30"
                                    value={brushSize}
                                    onChange={(e) => changeBrushSize(Number(e.target.value))}
                                    className="range range-primary range-xs flex-1"
                                />
                                <span className="text-sm w-8 text-right">{brushSize}</span>
                            </div>
                        </div>

                        <div className="flex justify-center mt-4">
                            <canvas
                                ref={canvasRef}
                                onMouseDown={startDrawing}
                                onMouseMove={draw}
                                onMouseUp={finishDrawing}
                                onMouseLeave={finishDrawing}
                                className="border border-base-300 rounded-lg cursor-crosshair bg-white"
                            />
                        </div>
                        <div className="flex justify-between mt-4">
                            <div className="flex gap-2">
                                <button
                                    onClick={saveImage}
                                    className="btn btn-ghost btn-sm gap-2 transition-all hover:scale-105"
                                >
                                    <Download className="w-4 h-4" />
                                    保存
                                </button>
                                <label className="btn btn-ghost btn-sm gap-2 transition-all hover:scale-105 cursor-pointer">
                                    <Upload className="w-4 h-4" />
                                    上传
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={uploadImage}
                                    />
                                </label>
                            </div>
                            <button
                                onClick={recognizeImage}
                                disabled={isLoading}
                                className="btn btn-primary btn-sm gap-2 transition-all hover:scale-105 hover:shadow-lg"
                            >
                                {isLoading ? (
                                    <>
                                        <span className="loading loading-spinner loading-xs"></span>
                                        识别中...
                                    </>
                                ) : (
                                    <>
                                        <Image className="w-4 h-4" />
                                        识别
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* 右侧：识别结果和历史记录 */}
                <div className="space-y-4">
                    {/* 识别结果 */}
                    {prediction && (
                        <div className="bg-base-100 rounded-lg p-4 shadow-sm animate-fade-in">
                            <h3 className="font-medium mb-3">识别结果</h3>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-lg font-semibold">{prediction.label}</span>
                                    <span className="text-primary">
                                        {(prediction.confidence * 100).toFixed(1)}%
                                    </span>
                                </div>
                                <div className="space-y-2">
                                    <div className="text-sm text-base-content/70">其他可能的答案：</div>
                                    {prediction.alternatives.map((alt, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between text-sm"
                                        >
                                            <span>{alt.label}</span>
                                            <span className="text-base-content/70">
                                                {(alt.confidence * 100).toFixed(1)}%
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 历史记录 */}
                    <div className="bg-base-100 rounded-lg p-4 shadow-sm">
                        <h3 className="font-medium mb-3">历史记录</h3>
                        <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar">
                            {history.length === 0 ? (
                                <div className="text-center text-base-content/50 py-4">
                                    暂无识别记录
                                </div>
                            ) : (
                                history.map((item, index) => (
                                    <div
                                        key={index}
                                        className="flex items-start gap-3 p-2 rounded-lg hover:bg-base-200 transition-colors"
                                    >
                                        <img
                                            src={item.image}
                                            alt="识别图片"
                                            className="w-16 h-16 object-contain bg-white rounded border border-base-300"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between">
                                                <span className="font-medium truncate">
                                                    {item.prediction.label}
                                                </span>
                                                <span className="text-sm text-base-content/70">
                                                    {(item.prediction.confidence * 100).toFixed(1)}%
                                                </span>
                                            </div>
                                            <div className="text-xs text-base-content/50 mt-1">
                                                {item.timestamp}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ImageRecognition; 