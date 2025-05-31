import { useState, useEffect } from 'react';
import { Search, RefreshCw, HelpCircle, Lightbulb, X, ArrowLeft, Target } from 'lucide-react';

const NumberGuessing = ({ onBack }) => {
    const [gameState, setGameState] = useState({
        isPlaying: false,
        targetNumber: 0,
        aiGuess: 0,
        min: 1,
        max: 100,
        attempts: 0,
        history: [],
        message: '',
        gameOver: false
    });

    const [showHelp, setShowHelp] = useState(false);
    const [showKnowledge, setShowKnowledge] = useState(false);
    const [showGuide, setShowGuide] = useState(true);

    // 初始化游戏
    const startGame = () => {
        const target = Math.floor(Math.random() * 100) + 1;
        setGameState({
            isPlaying: true,
            targetNumber: target,
            aiGuess: 50,
            min: 1,
            max: 100,
            attempts: 1,
            history: [{ guess: 50, result: '等待玩家反馈' }],
            message: 'AI 猜测是 50，这个数字是太大、太小还是正确？',
            gameOver: false
        });
        setShowGuide(false);
    };

    // AI 进行下一次猜测
    const makeGuess = (feedback) => {
        if (gameState.gameOver) return;

        const { min, max, aiGuess, attempts, history } = gameState;
        let newMin = min;
        let newMax = max;
        let result = '';

        if (feedback === 'tooHigh') {
            newMax = aiGuess - 1;
            result = '太大';
        } else if (feedback === 'tooLow') {
            newMin = aiGuess + 1;
            result = '太小';
        } else if (feedback === 'correct') {
            setGameState(prev => ({
                ...prev,
                gameOver: true,
                message: `AI 猜对了！用了 ${attempts} 次尝试。`,
                history: [...history.slice(0, -1), { guess: aiGuess, result: '正确' }]
            }));
            // 延迟显示知识点弹窗
            setTimeout(() => {
                setShowKnowledge(true);
            }, 1500);
            return;
        }

        const newGuess = Math.floor((newMin + newMax) / 2);

        if (newMin > newMax) {
            setGameState(prev => ({
                ...prev,
                gameOver: true,
                message: '游戏出现错误，请重新开始！',
                history: [...history.slice(0, -1), { guess: aiGuess, result }]
            }));
            return;
        }

        // 更新历史记录，将当前猜测的结果和下一次猜测合并为一条记录
        const currentGuess = history[history.length - 1].guess;
        const newHistory = [
            ...history.slice(0, -1),
            { guess: currentGuess, result }
        ];

        setGameState(prev => ({
            ...prev,
            min: newMin,
            max: newMax,
            aiGuess: newGuess,
            attempts: attempts + 1,
            history: [...newHistory, { guess: newGuess, result: '等待玩家反馈' }],
            message: `AI 猜测是 ${newGuess}，这个数字是太大、太小还是正确？`
        }));
    };

    return (
        <div className="p-4 w-full max-w-2xl mx-auto">
            {/* 返回按钮和游戏标题 */}
            {gameState.isPlaying && (
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
                                <Target className="w-5 h-5 text-primary animate-bounce-subtle" />
                                <Search className="w-3 h-3 text-primary absolute -top-1 -right-1 animate-pulse-subtle" />
                            </div>
                            AI 猜数字游戏
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
                                data-tip="算法知识点"
                            >
                                <Lightbulb className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 引导提示弹窗 */}
            {showGuide && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
                    <div className="bg-base-100 rounded-lg p-6 max-w-lg w-full mx-4 relative animate-slide-up">
                        {/* 返回按钮 */}
                        <button
                            onClick={onBack}
                            className="btn btn-ghost btn-sm gap-2 absolute top-4 left-4 transition-all hover:translate-x-[-4px]"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            返回游戏列表
                        </button>

                        <div className="flex items-start gap-4 mt-8">
                            <div className="bg-primary/20 p-3 rounded-full animate-pulse-subtle relative">
                                <Target className="w-6 h-6 text-primary" />
                                <Search className="w-4 h-4 text-primary absolute -top-1 -right-1" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold mb-3 animate-slide-right">欢迎来到 AI 猜数字游戏！</h3>
                                <p className="text-base-content/80 mb-6 animate-slide-right animation-delay-200">
                                    在这个游戏中，你将看到 AI 如何使用二分查找算法来猜测数字。
                                    系统会随机生成一个 1-100 之间的数字，AI 会通过算法来猜测这个数字。
                                    通过这个游戏，你可以直观地了解二分查找算法的工作原理。
                                </p>
                                <div className="flex justify-end animate-slide-up animation-delay-300">
                                    <button
                                        onClick={startGame}
                                        className="btn btn-primary gap-2 transition-all hover:scale-105 hover:shadow-lg"
                                    >
                                        <Target className="w-4 h-4" />
                                        开始游戏
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
                            <li>系统会随机生成一个 1-100 之间的数字</li>
                            <li>AI 会通过二分查找算法来猜测这个数字</li>
                            <li>每次猜测后，你需要告诉 AI 猜测是太大、太小还是正确</li>
                            <li>观察 AI 如何通过二分查找快速找到目标数字</li>
                            <li>了解算法思维和二分查找的工作原理</li>
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
                                算法知识点讲解
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
                                <h4 className="font-medium mb-2">1. 什么是二分查找？</h4>
                                <p className="text-sm text-base-content/80">
                                    二分查找是一种高效的搜索算法，它通过将搜索范围不断减半来快速找到目标值。
                                    在这个游戏中，AI 每次都会选择当前范围的中间值进行猜测。
                                </p>
                            </div>
                            <div>
                                <h4 className="font-medium mb-2">2. 为什么二分查找这么快？</h4>
                                <p className="text-sm text-base-content/80">
                                    二分查找的时间复杂度是 O(log n)，这意味着每次猜测后，搜索范围都会减半。
                                    对于 1-100 的范围，最多只需要 7 次猜测就能找到目标数字。
                                </p>
                            </div>
                            <div>
                                <h4 className="font-medium mb-2">3. 实际应用场景</h4>
                                <p className="text-sm text-base-content/80">
                                    - 在有序数组中查找元素<br />
                                    - 数据库索引查找<br />
                                    - 游戏中的数值计算<br />
                                    - 机器学习中的参数优化
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

            {/* 游戏内容 */}
            {gameState.isPlaying && (
                <div className="animate-fade-in">
                    {/* 游戏状态显示 */}
                    <div className="bg-base-200 rounded-lg p-3 mb-4 transition-all hover:shadow-md">
                        <p className="text-center text-lg font-medium">
                            {gameState.message}
                        </p>
                        <p className="text-center text-sm text-base-content/70 mt-1">
                            当前范围：{gameState.min} - {gameState.max}
                        </p>
                    </div>

                    {/* 游戏控制按钮 */}
                    <div className="flex justify-center gap-4 mb-4">
                        {!gameState.gameOver && (
                            <div className="flex gap-2 animate-slide-up">
                                <button
                                    onClick={() => makeGuess('tooHigh')}
                                    className="btn btn-outline transition-all hover:scale-105 hover:shadow-md"
                                >
                                    太大
                                </button>
                                <button
                                    onClick={() => makeGuess('correct')}
                                    className="btn btn-primary transition-all hover:scale-105 hover:shadow-lg"
                                >
                                    正确
                                </button>
                                <button
                                    onClick={() => makeGuess('tooLow')}
                                    className="btn btn-outline transition-all hover:scale-105 hover:shadow-md"
                                >
                                    太小
                                </button>
                            </div>
                        )}
                        {gameState.gameOver && (
                            <button
                                onClick={startGame}
                                className="btn btn-primary gap-2 transition-all hover:scale-105 hover:shadow-lg animate-bounce-subtle"
                            >
                                <RefreshCw className="w-4 h-4" />
                                再来一局
                            </button>
                        )}
                    </div>

                    {/* 猜测历史记录 */}
                    <div className="bg-base-200 rounded-lg p-3 w-full transition-all hover:shadow-md">
                        <h3 className="font-medium mb-2">猜测历史：</h3>
                        <div className="space-y-2 h-[220px] overflow-y-auto pr-2 custom-scrollbar bg-base-100 rounded-lg p-2">
                            {gameState.history.length === 0 ? (
                                <div className="flex items-center justify-center h-full text-base-content/50 animate-pulse-subtle">
                                    等待 AI 开始猜测...
                                </div>
                            ) : (
                                gameState.history.map((item, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between bg-base-200 p-2 rounded transition-all hover:bg-base-300"
                                    >
                                        <span>第 {Math.floor(index / 2) + 1} 次猜测：{item.guess}</span>
                                        <span className="text-base-content/70">{item.result}</span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NumberGuessing; 