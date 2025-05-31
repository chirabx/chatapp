import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, HelpCircle, Lightbulb, X, RefreshCw, Timer, Settings, BarChart } from 'lucide-react';
import { toast } from 'react-hot-toast';

const CELL_SIZE = 30;
const WALL_COLOR = '#1a1a1a';
const PATH_COLOR = '#ffffff';
const START_COLOR = '#4CAF50';
const END_COLOR = '#f44336';
const AI_PATH_COLOR = '#2196F3';
const AI_THINKING_COLOR = '#FFC107';

const MazeGame = ({ onBack }) => {
    const [maze, setMaze] = useState([]);
    const [mazeSize, setMazeSize] = useState(15);
    const [difficulty, setDifficulty] = useState('medium');
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSolving, setIsSolving] = useState(false);
    const [showHelp, setShowHelp] = useState(false);
    const [showKnowledge, setShowKnowledge] = useState(false);
    const [showGuide, setShowGuide] = useState(true);
    const [showControl, setShowControl] = useState(false);
    const [showStats, setShowStats] = useState(false);
    const [time, setTime] = useState(0);
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const [aiPath, setAiPath] = useState([]);
    const [aiThinking, setAiThinking] = useState([]);

    const canvasRef = useRef(null);
    const timerRef = useRef(null);

    // 初始化迷宫
    useEffect(() => {
        generateMaze();
        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [mazeSize, difficulty]);

    // 生成迷宫
    const generateMaze = () => {
        setIsGenerating(true);
        const newMaze = Array(mazeSize).fill().map(() => Array(mazeSize).fill(1));

        // 使用深度优先搜索生成迷宫
        const stack = [];
        const start = { x: 1, y: 1 };
        newMaze[start.y][start.x] = 0;
        stack.push(start);

        while (stack.length > 0) {
            const current = stack[stack.length - 1];
            const neighbors = getUnvisitedNeighbors(current, newMaze);

            if (neighbors.length === 0) {
                stack.pop();
                continue;
            }

            const next = neighbors[Math.floor(Math.random() * neighbors.length)];
            newMaze[next.y][next.x] = 0;
            newMaze[current.y + (next.y - current.y) / 2][current.x + (next.x - current.x) / 2] = 0;
            stack.push(next);
        }

        // 设置起点和终点
        newMaze[1][1] = 2; // 起点
        newMaze[mazeSize - 2][mazeSize - 2] = 3; // 终点

        setMaze(newMaze);
        setAiPath([]);
        setAiThinking([]);
        setIsGenerating(false);
        resetTimer();
    };

    // 获取未访问的邻居
    const getUnvisitedNeighbors = (cell, maze) => {
        const neighbors = [];
        const directions = [
            { x: 0, y: -2 }, // 上
            { x: 2, y: 0 },  // 右
            { x: 0, y: 2 },  // 下
            { x: -2, y: 0 }  // 左
        ];

        for (const dir of directions) {
            const newX = cell.x + dir.x;
            const newY = cell.y + dir.y;

            if (
                newX > 0 && newX < mazeSize - 1 &&
                newY > 0 && newY < mazeSize - 1 &&
                maze[newY][newX] === 1
            ) {
                neighbors.push({ x: newX, y: newY });
            }
        }

        return neighbors;
    };

    // 绘制迷宫
    const drawMaze = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const size = mazeSize * CELL_SIZE;

        canvas.width = size;
        canvas.height = size;

        // 绘制背景
        ctx.fillStyle = PATH_COLOR;
        ctx.fillRect(0, 0, size, size);

        // 绘制迷宫
        for (let y = 0; y < mazeSize; y++) {
            for (let x = 0; x < mazeSize; x++) {
                if (maze[y][x] === 1) {
                    ctx.fillStyle = WALL_COLOR;
                    ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
                } else if (maze[y][x] === 2) {
                    ctx.fillStyle = START_COLOR;
                    ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
                } else if (maze[y][x] === 3) {
                    ctx.fillStyle = END_COLOR;
                    ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
                }
            }
        }

        // 绘制 AI 思考路径
        ctx.fillStyle = AI_THINKING_COLOR;
        aiThinking.forEach(cell => {
            ctx.fillRect(
                cell.x * CELL_SIZE + CELL_SIZE / 4,
                cell.y * CELL_SIZE + CELL_SIZE / 4,
                CELL_SIZE / 2,
                CELL_SIZE / 2
            );
        });

        // 绘制 AI 最终路径
        ctx.strokeStyle = AI_PATH_COLOR;
        ctx.lineWidth = 3;
        ctx.beginPath();
        aiPath.forEach((cell, index) => {
            if (index === 0) {
                ctx.moveTo(
                    cell.x * CELL_SIZE + CELL_SIZE / 2,
                    cell.y * CELL_SIZE + CELL_SIZE / 2
                );
            } else {
                ctx.lineTo(
                    cell.x * CELL_SIZE + CELL_SIZE / 2,
                    cell.y * CELL_SIZE + CELL_SIZE / 2
                );
            }
        });
        ctx.stroke();
    };

    // 当迷宫或 AI 路径更新时重绘
    useEffect(() => {
        if (maze.length > 0) {
            drawMaze();
        }
    }, [maze, aiPath, aiThinking]);

    // 计时器
    const startTimer = () => {
        setIsTimerRunning(true);
        timerRef.current = setInterval(() => {
            setTime(prev => prev + 1);
        }, 1000);
    };

    const stopTimer = () => {
        setIsTimerRunning(false);
        if (timerRef.current) {
            clearInterval(timerRef.current);
        }
    };

    const resetTimer = () => {
        stopTimer();
        setTime(0);
    };

    // 格式化时间
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // AI 寻路
    const solveMaze = async () => {
        if (isSolving) return;
        setIsSolving(true);
        resetTimer();
        startTimer();

        // 使用 A* 算法寻路
        const start = { x: 1, y: 1 };
        const end = { x: mazeSize - 2, y: mazeSize - 2 };
        const openSet = [start];
        const closedSet = new Set();
        const cameFrom = new Map();
        const gScore = new Map();
        const fScore = new Map();

        gScore.set(`${start.x},${start.y}`, 0);
        fScore.set(`${start.x},${start.y}`, heuristic(start, end));

        while (openSet.length > 0) {
            // 可视化 AI 思考过程
            setAiThinking([...closedSet].map(pos => {
                const [x, y] = pos.split(',').map(Number);
                return { x, y };
            }));

            // 找到 fScore 最小的节点
            const current = openSet.reduce((a, b) => {
                const aScore = fScore.get(`${a.x},${a.y}`) || Infinity;
                const bScore = fScore.get(`${b.x},${b.y}`) || Infinity;
                return aScore < bScore ? a : b;
            });

            if (current.x === end.x && current.y === end.y) {
                // 找到路径
                const path = reconstructPath(cameFrom, current);
                setAiPath(path);
                stopTimer();
                setIsSolving(false);
                // 显示知识点
                setShowKnowledge(true);
                return;
            }

            // 从开放集合中移除当前节点
            openSet.splice(openSet.indexOf(current), 1);
            closedSet.add(`${current.x},${current.y}`);

            // 检查邻居
            const neighbors = getNeighbors(current);
            for (const neighbor of neighbors) {
                if (closedSet.has(`${neighbor.x},${neighbor.y}`)) {
                    continue;
                }

                const tentativeGScore = (gScore.get(`${current.x},${current.y}`) || Infinity) + 1;

                if (!openSet.some(n => n.x === neighbor.x && n.y === neighbor.y)) {
                    openSet.push(neighbor);
                } else if (tentativeGScore >= (gScore.get(`${neighbor.x},${neighbor.y}`) || Infinity)) {
                    continue;
                }

                cameFrom.set(`${neighbor.x},${neighbor.y}`, current);
                gScore.set(`${neighbor.x},${neighbor.y}`, tentativeGScore);
                fScore.set(
                    `${neighbor.x},${neighbor.y}`,
                    tentativeGScore + heuristic(neighbor, end)
                );
            }

            // 添加延迟以可视化过程
            await new Promise(resolve => setTimeout(resolve, 50));
        }

        stopTimer();
        setIsSolving(false);
        toast.error('无法找到路径！');
    };

    // 获取邻居节点
    const getNeighbors = (cell) => {
        const neighbors = [];
        const directions = [
            { x: 0, y: -1 }, // 上
            { x: 1, y: 0 },  // 右
            { x: 0, y: 1 },  // 下
            { x: -1, y: 0 }  // 左
        ];

        for (const dir of directions) {
            const newX = cell.x + dir.x;
            const newY = cell.y + dir.y;

            if (
                newX >= 0 && newX < mazeSize &&
                newY >= 0 && newY < mazeSize &&
                maze[newY][newX] !== 1
            ) {
                neighbors.push({ x: newX, y: newY });
            }
        }

        return neighbors;
    };

    // 启发式函数（曼哈顿距离）
    const heuristic = (a, b) => {
        return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
    };

    // 重建路径
    const reconstructPath = (cameFrom, current) => {
        const path = [current];
        let currentKey = `${current.x},${current.y}`;

        while (cameFrom.has(currentKey)) {
            current = cameFrom.get(currentKey);
            currentKey = `${current.x},${current.y}`;
            path.unshift(current);
        }

        return path;
    };

    return (
        <div className="p-4 w-full max-w-4xl mx-auto">
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
                            <RefreshCw className="w-5 h-5 text-primary animate-spin-slow" />
                        </div>
                        AI 走迷宫挑战
                    </h2>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setShowControl(true)}
                            className="btn btn-ghost btn-sm tooltip tooltip-left transition-all hover:scale-110"
                            data-tip="控制面板"
                        >
                            <Settings className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setShowStats(true)}
                            className="btn btn-ghost btn-sm tooltip tooltip-left transition-all hover:scale-110"
                            data-tip="统计信息"
                        >
                            <BarChart className="w-4 h-4" />
                        </button>
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
                            onClick={() => setShowGuide(false)}
                            className="btn btn-ghost btn-sm btn-circle absolute top-4 right-4"
                        >
                            <X className="w-4 h-4" />
                        </button>

                        <div className="flex items-start gap-4 mt-8">
                            <div className="bg-primary/20 p-3 rounded-full animate-pulse-subtle">
                                <RefreshCw className="w-6 h-6 text-primary" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold mb-3 animate-slide-right">欢迎来到 AI 走迷宫挑战！</h3>
                                <p className="text-base-content/80 mb-6 animate-slide-right animation-delay-200">
                                    在这个游戏中，你可以观察 AI 是如何解决迷宫问题的。
                                    通过这个游戏，你可以了解 AI 的寻路算法和决策过程。
                                    选择不同的难度级别，看看 AI 的表现如何！
                                </p>
                                <div className="flex justify-end animate-slide-up animation-delay-300">
                                    <button
                                        onClick={() => setShowGuide(false)}
                                        className="btn btn-primary gap-2 transition-all hover:scale-105 hover:shadow-lg"
                                    >
                                        <RefreshCw className="w-4 h-4" />
                                        开始挑战
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
                            <li>选择迷宫大小和难度级别</li>
                            <li>点击"生成迷宫"按钮创建新的迷宫</li>
                            <li>点击"开始寻路"按钮让 AI 解决迷宫</li>
                            <li>观察 AI 的思考过程（黄色方块）和最终路径（蓝色线条）</li>
                            <li>计时器会记录 AI 解决迷宫所需的时间</li>
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
                    <div className="bg-base-100 rounded-lg p-4 max-w-lg w-full mx-4 animate-slide-up">
                        <div className="flex items-start justify-between mb-2">
                            <h3 className="text-base font-semibold flex items-center gap-2">
                                <Lightbulb className="w-4 h-4 text-primary" />
                                AI 寻路算法小知识
                            </h3>
                            <button
                                onClick={() => setShowKnowledge(false)}
                                className="btn btn-ghost btn-sm btn-circle"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="space-y-3">
                            <div>
                                <h4 className="font-medium mb-2 text-sm">1. 什么是寻路算法？</h4>
                                <p className="text-sm text-base-content/80">
                                    想象一下，你在迷宫里找出口。你会怎么走呢？可能会：
                                    - 记住已经走过的路，避免重复
                                    - 选择看起来离出口更近的方向
                                    - 如果走错了，就退回来重新选择

                                    AI 也是这样思考的！它用"寻路算法"来找到从起点到终点的最佳路径。
                                </p>
                            </div>
                            <div>
                                <h4 className="font-medium mb-2 text-sm">2. A* 算法是如何工作的？</h4>
                                <p className="text-sm text-base-content/80">
                                    A* 算法就像是一个聪明的探险家：
                                    - 它会记住已经探索过的地方（黄色方块）
                                    - 计算每个位置到终点的距离
                                    - 选择看起来最有希望的方向前进
                                    - 如果发现更好的路，就会改变方向

                                    就像你在迷宫里，会优先选择看起来离出口更近的路一样！
                                </p>
                            </div>
                            <div>
                                <h4 className="font-medium mb-2 text-sm">3. 生活中的寻路算法</h4>
                                <p className="text-sm text-base-content/80">
                                    寻路算法在我们的生活中随处可见：
                                    - 手机导航：帮你找到最短的回家路线
                                    - 游戏中的 NPC：知道如何避开障碍物
                                    - 机器人：能够自主导航和避障
                                    - 快递配送：规划最优的送货路线

                                    这些技术都使用了类似的寻路算法！
                                </p>
                            </div>
                            <div>
                                <h4 className="font-medium mb-2 text-sm">4. 有趣的实验</h4>
                                <p className="text-sm text-base-content/80">
                                    你可以试试：
                                    - 观察 AI 在不同难度下的表现
                                    - 看看 AI 的思考过程（黄色方块）和最终路径（蓝色线条）有什么不同
                                    - 尝试预测 AI 会选择的路径
                                    - 比较不同大小迷宫的解决时间

                                    通过这个游戏，你可以更好地理解 AI 是如何"思考"的！
                                </p>
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 mt-3">
                            <button
                                onClick={() => setShowKnowledge(false)}
                                className="btn btn-primary btn-sm"
                            >
                                明白了
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 主要内容 */}
            <div className="space-y-3">
                {/* 迷宫画布 */}
                <div className="bg-base-100 rounded-lg p-2 shadow-sm">
                    <div className="flex justify-center">
                        <div className="relative">
                            <canvas
                                ref={canvasRef}
                                className="border border-base-300 rounded-lg"
                            />
                        </div>
                    </div>
                </div>

                {/* 主要控制按钮 */}
                <div className="flex justify-center gap-2">
                    <button
                        onClick={generateMaze}
                        disabled={isGenerating || isSolving}
                        className="btn btn-primary btn-sm gap-2 transition-all hover:scale-105"
                    >
                        {isGenerating ? (
                            <>
                                <span className="loading loading-spinner loading-xs"></span>
                                生成迷宫
                            </>
                        ) : (
                            <>
                                <RefreshCw className="w-4 h-4" />
                                生成迷宫
                            </>
                        )}
                    </button>
                    <button
                        onClick={solveMaze}
                        disabled={isGenerating || isSolving || maze.length === 0}
                        className="btn btn-primary btn-sm gap-2 transition-all hover:scale-105"
                    >
                        {isSolving ? (
                            <>
                                <span className="loading loading-spinner loading-xs"></span>
                                寻路中...
                            </>
                        ) : (
                            <>
                                <RefreshCw className="w-4 h-4" />
                                开始寻路
                            </>
                        )}
                    </button>
                </div>

                {/* 计时器 */}
                <div className="flex justify-center items-center gap-2">
                    <Timer className="w-4 h-4 text-primary" />
                    <span className="font-mono text-base">{formatTime(time)}</span>
                </div>
            </div>

            {/* 控制面板弹窗 */}
            {showControl && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
                    <div className="bg-base-100 rounded-lg p-4 max-w-sm w-full mx-4 animate-slide-up">
                        <div className="flex items-start justify-between mb-2">
                            <h3 className="text-base font-semibold flex items-center gap-2">
                                <Settings className="w-4 h-4 text-primary" />
                                游戏设置
                            </h3>
                            <button
                                onClick={() => setShowControl(false)}
                                className="btn btn-ghost btn-sm btn-circle"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="space-y-3">
                            <div className="form-control">
                                <label className="label py-1">
                                    <span className="label-text text-sm">迷宫大小</span>
                                </label>
                                <select
                                    className="select select-bordered select-sm w-full"
                                    value={mazeSize}
                                    onChange={(e) => setMazeSize(Number(e.target.value))}
                                    disabled={isGenerating || isSolving}
                                >
                                    <option value={11}>小 (11x11)</option>
                                    <option value={15}>中 (15x15)</option>
                                    <option value={21}>大 (21x21)</option>
                                </select>
                            </div>
                            <div className="form-control">
                                <label className="label py-1">
                                    <span className="label-text text-sm">难度级别</span>
                                </label>
                                <select
                                    className="select select-bordered select-sm w-full"
                                    value={difficulty}
                                    onChange={(e) => setDifficulty(e.target.value)}
                                    disabled={isGenerating || isSolving}
                                >
                                    <option value="easy">简单</option>
                                    <option value="medium">中等</option>
                                    <option value="hard">困难</option>
                                </select>
                            </div>
                            <div className="flex justify-end mt-4">
                                <button
                                    onClick={() => setShowControl(false)}
                                    className="btn btn-primary btn-sm"
                                >
                                    确定
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 统计信息弹窗 - 只在游戏完成后显示 */}
            {showStats && aiPath.length > 0 && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
                    <div className="bg-base-100 rounded-lg p-4 max-w-sm w-full mx-4 animate-slide-up">
                        <div className="flex items-start justify-between mb-2">
                            <h3 className="text-base font-semibold flex items-center gap-2">
                                <BarChart className="w-4 h-4 text-primary" />
                                游戏统计
                            </h3>
                            <button
                                onClick={() => setShowStats(false)}
                                className="btn btn-ghost btn-sm btn-circle"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="space-y-3">
                            {/* 图例说明 */}
                            <div>
                                <h4 className="font-medium mb-2 text-sm">图例说明</h4>
                                <div className="grid grid-cols-1 gap-1 text-sm">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 bg-[#1a1a1a] rounded"></div>
                                        <span>墙壁</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 bg-[#ffffff] rounded"></div>
                                        <span>路径</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 bg-[#4CAF50] rounded"></div>
                                        <span>起点</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 bg-[#f44336] rounded"></div>
                                        <span>终点</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 bg-[#FFC107] rounded"></div>
                                        <span>AI 思考</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 bg-[#2196F3] rounded"></div>
                                        <span>AI 路径</span>
                                    </div>
                                </div>
                            </div>

                            {/* 统计信息 */}
                            <div>
                                <h4 className="font-medium mb-2 text-sm">游戏数据</h4>
                                <div className="space-y-1 text-sm">
                                    <div className="flex justify-between">
                                        <span>迷宫大小</span>
                                        <span>{mazeSize}x{mazeSize}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>难度级别</span>
                                        <span className="capitalize">{difficulty}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>解决时间</span>
                                        <span>{formatTime(time)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>AI 思考节点</span>
                                        <span>{aiThinking.length}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>最终路径长度</span>
                                        <span>{aiPath.length}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MazeGame; 