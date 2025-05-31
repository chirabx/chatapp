import { useState } from 'react';
import { Gamepad2, ArrowLeft, Target, Search, Image, Brain, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import NumberGuessing from '../components/AIGames/NumberGuessing';
import ImageRecognition from '../components/AIGames/ImageRecognition';
import MazeGame from '../components/AIGames/MazeGame';

const AIGamesPage = () => {
    const [selectedGame, setSelectedGame] = useState(null);

    const games = [
        {
            id: 'number-guessing',
            title: 'AI 猜数字',
            description: '通过二分查找算法，观察 AI 如何快速猜出目标数字',
            icon: () => (
                <div className="relative">
                    <Target className="w-6 h-6 text-primary" />
                    <Search className="w-4 h-4 text-primary absolute -top-1 -right-1" />
                </div>
            ),
            component: NumberGuessing
        },
        {
            id: 'image-recognition',
            title: 'AI 图像识别挑战',
            description: '画图让 AI 识别，了解图像识别原理',
            icon: () => (
                <div className="relative">
                    <Image className="w-6 h-6 text-primary" />
                </div>
            ),
            component: ImageRecognition
        },
        {
            id: 'maze-game',
            title: 'AI 走迷宫挑战',
            description: '观察 AI 如何解决迷宫问题，了解寻路算法的奥秘！',
            icon: () => (
                <div className="relative">
                    <RefreshCw className="w-6 h-6 text-primary" />
                </div>
            ),
            component: MazeGame
        },
        // 后续可以添加更多游戏
        // {
        //     id: 'word-chain',
        //     title: 'AI 文字接龙',
        //     description: '与 AI 进行文字接龙，体验语言模型',
        //     icon: MessageSquare,
        //     component: WordChain
        // }
    ];

    return (
        <div className="min-h-screen bg-base-200 flex flex-col">
            {/* 页面头部 */}
            <div className="bg-base-100 shadow-sm">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link
                                to="/"
                                className="btn btn-ghost btn-sm gap-2 transition-all hover:translate-x-[-4px]"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                返回首页
                            </Link>
                            <h1 className="text-xl font-semibold flex items-center gap-2">
                                <Gamepad2 className="w-5 h-5" />
                                AI 趣味游戏
                            </h1>
                        </div>
                    </div>
                </div>
            </div>

            {/* 主要内容 */}
            <div className="flex-1 container mx-auto py-6 px-4">
                {!selectedGame ? (
                    // 游戏选择界面
                    <div className="max-w-3xl mx-auto">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                            {games.map(game => (
                                <div
                                    key={game.id}
                                    className="bg-base-100 rounded-lg shadow-sm p-5 hover:shadow-lg transition-all hover:scale-[1.01] cursor-pointer group relative overflow-hidden"
                                    onClick={() => setSelectedGame(game)}
                                >
                                    {/* 背景装饰 */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                                    {/* 卡片内容 */}
                                    <div className="relative">
                                        <div className="flex items-start gap-3 mb-3">
                                            <div className="bg-primary/10 p-2.5 rounded-lg group-hover:bg-primary/20 transition-colors duration-300 flex-shrink-0">
                                                {typeof game.icon === 'function' ? game.icon() : <game.icon className="w-5 h-5 text-primary" />}
                                            </div>
                                            <div>
                                                <h2 className="text-base font-semibold group-hover:text-primary transition-colors duration-300 mb-1">
                                                    {game.title}
                                                </h2>
                                                <p className="text-base-content/60 text-sm group-hover:text-base-content/80 transition-colors duration-300 leading-relaxed">
                                                    {game.description}
                                                </p>
                                            </div>
                                        </div>

                                        {/* 交互提示 */}
                                        <div className="flex items-center justify-end mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                            <span className="text-xs text-primary/70 flex items-center gap-1">
                                                点击开始
                                                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M5 12h14M12 5l7 7-7 7" />
                                                </svg>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* 未完待续提示 */}
                        <div className="mt-8 text-center">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-base-100 rounded-full shadow-sm">
                                <span className="text-sm text-base-content/60">更多游戏开发中</span>
                                <div className="flex gap-1">
                                    <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                    <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                    <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    // 游戏界面
                    <div className="max-w-4xl mx-auto">
                        <div className="bg-base-100 rounded-lg shadow-sm">
                            <selectedGame.component onBack={() => setSelectedGame(null)} />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AIGamesPage; 