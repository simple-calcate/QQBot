import os

html = []
html.append("""<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<title>H7120Z 期末复习 - 知识点深度分析</title>
<style>
@page { size: A4; margin: 15mm 12mm; }
body { font-family: "Microsoft YaHei", "SimHei", sans-serif; font-size: 10.5px; line-height: 1.55; color: #222; }
h1 { color: #003399; font-size: 18px; border-bottom: 3px solid #003399; padding-bottom: 4px; margin-top: 18px; page-break-before: always; }
h1:first-of-type { page-break-before: avoid; }
h2 { color: #005500; font-size: 13px; margin-top: 14px; border-left: 4px solid #005500; padding-left: 8px; }
h3 { color: #444; font-size: 11px; margin-top: 10px; }
p { margin: 4px 0; }
.formula { background: #FFF8E1; border: 1px solid #E8C547; border-radius: 3px; padding: 5px 10px; margin: 5px 0; font-family: "Consolas", "Courier New", monospace; font-size: 10.5px; }
.key { background: #FFE0E0; border: 1px solid #E06060; border-radius: 3px; padding: 4px 10px; margin: 4px 0; }
.key strong { color: #C00; }
.tip { background: #E0FFE0; border: 1px solid #60A060; border-radius: 3px; padding: 4px 10px; margin: 4px 0; font-size: 10px; }
.example { background: #F0F8FF; border: 1px solid #88B; border-radius: 3px; padding: 8px 10px; margin: 8px 0; page-break-inside: avoid; }
.example-title { background: #D0E8FF; margin: -8px -10px 8px -10px; padding: 4px 10px; font-weight: bold; color: #004488; font-size: 10.5px; }
ul, ol { margin: 3px 0; padding-left: 20px; }
li { margin: 2px 0; }
table { border-collapse: collapse; width: 100%; margin: 5px 0; font-size: 9.5px; }
th, td { border: 1px solid #888; padding: 3px 6px; }
th { background: #E8EEF8; }
.cover { text-align: center; padding-top: 50px; page-break-after: always; }
.cover h1 { border: none; font-size: 26px; }
.star { color: #C00; font-weight: bold; }
.derive { background: #F8F0FF; border: 1px solid #A080C0; border-radius: 3px; padding: 5px 10px; margin: 5px 0; font-size: 10px; }
</style>
</head>
<body>

<div class="cover">
<h1 style="color:#003399;">H7120Z</h1>
<h2 style="border:none; font-size:16px;">Mechanics of Mechanisms and Robots</h2>
<h2 style="border:none; color:#888; font-size:13px;">期末复习 - 知识点深度分析（课件+Revision对照版）</h2>
<hr style="width:150px; border:2px solid #003399;">
<p style="color:#999; font-size:10px;">Dr Ming Huang | University of Sussex</p>
<p style="color:#C00; font-size:10px; margin-top:20px;">本文档为知识点分析总结，不是课件搬运。<br>包含：公式推导、解题思路、易错点、例题详解。</p>
<p style="color:#666; font-size:9px;">对照课件: 1 Statics, 2.1 Kinematics of particles, 2.2 Kinematics of solid bodies,<br>3.1 Dynamics of particles, 3.2 Dynamics of solid bodies, 4.1 Mechanisms, 4.2 Robots, 5 Revision</p>
</div>
""")

# ============================================================
# CHAPTER 1: STATICS (对照课件 1 Statics + Revision)
# ============================================================
html.append("""
<h1>Chapter 1: Statics 静力学</h1>

<h2>1.1 核心思想</h2>
<p>静力学研究的是<strong>物体在力的作用下保持静止</strong>的条件。整章就围绕一个核心问题：<br>
"给定一堆力，物体能不能不动？如果能不动，约束反力是多少？"</p>
<div class="derive">
课件定义：For a solid body, static equilibrium means the resultant of all forces and moments of forces are zero.<br>
即：<strong>ΣF = 0</strong> 且 <strong>ΣM = 0</strong>
</div>

<h2>1.2 力的分解与合成</h2>
<p>力是矢量，但实际问题中我们不会用矢量箭头算数。分解成坐标方向的分量是所有后续计算的基础。</p>
<div class="formula">
2D: Fx = F cosα, &nbsp; Fy = F sinα<br>
F = √(Fx² + Fy²)<br>
3D: F = Fx·i + Fy·j + Fz·k, &nbsp; |F| = √(Fx² + Fy² + Fz²)
</div>
<div class="derive">
<strong>力的合成（课件）：</strong><br>
多个力的合力 R = ΣFi，分量分别相加：<br>
Rx = ΣFix, Ry = ΣFiy, Rz = ΣFiz<br>
|R| = √(Rx² + Ry² + Rz²)<br>
方向角：cosα = Rx/R, cosβ = Ry/R, cosγ = Rz/R
</div>

<h2>1.3 力矩 — 转动效果的度量</h2>
<div class="formula">
M_O = r × F &nbsp;&nbsp; (叉积，结果是矢量)<br>
|M| = |r| |F| sinα = F × d &nbsp;&nbsp; (d = 力臂，即转动点到力作用线的垂直距离)
</div>
<div class="derive">
<strong>课件推导 - 为什么力矩等于F×d：</strong><br>
设r与F夹角为α，则|r × F| = rF sinα<br>
令d = r sinα = r' sinα（从O到力作用线的垂距）<br>
所以 |M| = Fd。这就是"力 × 力臂"的由来。<br><br>
<strong>重要性质（课件）：</strong><br>
① 力矩方向由右手定则确定（垂直于r和F所在平面）<br>
② 力沿作用线滑动，力矩不变（因为AA₁×F=0，AA₁与F共线）<br>
③ 力偶矩：两个大小相等、方向相反、不共线的力 → M = F·d，在任意点取矩都一样
</div>

<h2>1.4 平衡条件 — 整章的核心</h2>
<div class="key">
<strong>★ ΣF = 0 （合力为零）<br>
★ ΣM = 0 （合力矩为零）</strong>
</div>
<div class="derive">
<strong>为什么两个条件都要满足？</strong><br>
ΣF=0只保证物体不平移，但可能转动（力偶就是例子：两个大小相等方向相反的力，合力为零但物体会转）。<br>
ΣM=0保证不转动。两个条件合起来才是真正的"不动"。
</div>
<h3>独立方程数</h3>
<table>
<tr><th>维度</th><th>独立方程数</th><th>最多未知量</th></tr>
<tr><td>2D（平面）</td><td>3（ΣFx=0, ΣFy=0, ΣM=0）</td><td>3</td></tr>
<tr><td>3D（空间）</td><td>6（ΣFx=ΣFy=ΣFz=ΣMx=ΣMy=ΣMz=0）</td><td>6</td></tr>
</table>

<h2>1.5 自由体图（FBD）— 最重要的技能</h2>
<div class="key">
<strong>★ FBD步骤（来自课件和Revision）：</strong><br>
① 选择研究对象（整体or单个构件）<br>
② 把它从周围环境中"切"出来<br>
③ 画出所有外力：已知力（重力、外载荷）+ 约束反力（支座、铰链、滑块）<br>
④ 建立坐标系，标注正方向<br>
⑤ 列平衡方程，求解
</div>

<h3>约束反力的判断</h3>
<table>
<tr><th>约束类型</th><th>反力特征</th><th>未知量数</th></tr>
<tr><td>固定支座（pin）</td><td>两个分力 XA, YA</td><td>2</td></tr>
<tr><td>滚动支座（roller）</td><td>一个垂直于接触面的力</td><td>1</td></tr>
<tr><td>固定端（cantilever）</td><td>两个分力 + 一个力矩</td><td>3</td></tr>
<tr><td>二力构件</td><td>力沿杆方向，两端力相等反向</td><td>1（力的大小）</td></tr>
</table>
<div class="tip">
<strong>解题技巧：二力构件</strong><br>
如果一个构件只在两端受力（无其他外力），且处于平衡，则两端的力必须：大小相等、方向相反、沿两端连线方向。<br>
这可以大幅减少未知量！
</div>

<h2>1.6 三力构件</h2>
<p>如果一个构件只受三个力且处于平衡，这三个力的作用线<strong>必须交于一点</strong>。</p>
<div class="derive">
<strong>证明思路：</strong><br>
设三个力F1、F2、F3平衡。F1和F2的合力R12必须与F3大小相等方向相反。<br>
R12的作用线经过F1和F2的交点，F3必须经过同一个点，否则力矩不为零。
</div>

<h2>1.7 摩擦</h2>
<div class="formula">
F = μN &nbsp;&nbsp; (Amontons-Coulomb公式)<br>
临界角：α = arctan(μ)
</div>
<div class="derive">
<strong>临界角推导：</strong><br>
斜面上物体，倾角α，重力W。<br>
分解：N = W cosα（法向），T = W sinα（沿斜面）<br>
不滑动条件：T ≤ μN → W sinα ≤ μ W cosα → tanα ≤ μ<br>
临界角：α = arctan(μ)<br>
<strong>注意：临界角与重量无关！</strong>
</div>

<div class="example">
<div class="example-title">例题1：挖掘机臂静力分析（来自课件 Practice Problem 1）</div>
<p><strong>题目：</strong>铲斗总重W=1600N，臂ABC由液压缸BD支撑，BD水平。AB=0.8m, BC=1.4m(含铲斗)。求BD力和A点反力。</p>
<p><strong>Step 1 — 识别构件：</strong>BD是液压缸 → 二力构件 → 力沿BD方向（水平）</p>
<p><strong>Step 2 — 隔离臂+铲斗，对A取矩：</strong><br>
ΣMA = 0: FBD × 0.8 - W × 2.4 = 0<br>
FBD = 1600 × 2.4 / 0.8 = <strong>4800 N</strong></p>
<p><strong>Step 3 — 力平衡：</strong><br>
ΣFx = 0: XA = FBD = 4800 N<br>
ΣFy = 0: YA = W = 1600 N<br>
|FA| = √(4800² + 1600²) = <strong>5060 N</strong></p>
<p><strong>考点：</strong>二力构件判断、力矩平衡、合力计算</p>
</div>

<div class="example">
<div class="example-title">例题2：四连杆机构求扭矩（来自课件 Practice Problem 2）</div>
<p><strong>题目：</strong>F=100N施加在铰链A，OA和AB是两根杆，OA与竖直方向夹角20°，AB与水平方向夹角45°。求维持平衡的扭矩τ（BC=0.3m）。</p>
<p><strong>Step 1 — 分离铰链A：</strong><br>
OA和AB都是二力构件 → 力沿杆方向。设FOA沿OA方向，FAB沿AB方向。</p>
<p><strong>Step 2 — 力平衡（水平x和竖直y）：</strong><br>
x: F + FAB cos45° - FOA sin20° = 0 &nbsp; ...(1)<br>
y: -FAB sin45° - FOA cos20° = 0 &nbsp; ...(2)<br>
从(2): FAB = -FOA cos20°/sin45°<br>
代入(1): F - FOA(cos20°·cos45°/sin45° + sin20°) = 0<br>
FOA = F / (cos20° + sin20°) = 100/1.282 = <strong>78 N</strong><br>
FAB = -78 × cos20°/sin45° = <strong>-103.4 N</strong>（受压）</p>
<p><strong>Step 3 — 分离BC杆，对C取矩：</strong><br>
ΣMC = 0: FAB sin45° × 0.3 - τ = 0<br>
τ = 103.4 × sin45° × 0.3 = <strong>21.9 Nm</strong></p>
</div>

<div class="example">
<div class="example-title">例题3：合力矩计算（来自课件 Practice Problem 1）</div>
<p><strong>题目：</strong>260kN和430kN两个力作用在结构上，求对P(-2,-3)点的合力矩。</p>
<p><strong>解法：</strong><br>
① 分解各力：260kN → (100i + 240j)kN（5:12:13三角），430kN → (-372.4i - 215j)kN（60°分解）<br>
② 合力 R = (-272.4i + 25j) kN, |R| = 273.5 kN<br>
③ 各力对P的力矩用 M = r × F 计算（叉积）</p>
</div>
""")

# ============================================================
# CHAPTER 2.1: PARTICLE KINEMATICS (对照课件 2.1 + Revision)
# ============================================================
html.append("""
<h1>Chapter 2.1: Kinematics of Particles 质点运动学</h1>

<h2>2.1.1 核心思想</h2>
<p>运动学只研究<strong>运动的几何规律</strong>，完全不涉及力。问题是："已知运动规律，求速度和加速度"或者反过来。</p>
<div class="key">
<strong>★ 三个运动要素：</strong><br>
① 轨迹（Path）— 质点经过的几何路径<br>
② 速度（Velocity）v = dr/dt — 位置变化率，矢量<br>
③ 加速度（Acceleration）a = dv/dt — 速度变化率，矢量
</div>
<div class="derive">
<strong>理解加速度（来自课件和Revision）：</strong><br>
加速度描述的是速度的<strong>变化</strong>，包括大小和方向两个方面。<br>
匀速圆周运动：速度大小不变，但方向在变 → 有加速度！<br>
只有匀速直线运动时加速度才为零。
</div>
<div class="derive">
<strong>正问题 vs 逆问题（课件）：</strong><br>
正问题：x(t) → v(t) = dx/dt → a(t) = dv/dt &nbsp; (求导)<br>
逆问题：a(t) → v(t) = ∫a dt → x(t) = ∫v dt &nbsp; (积分，需要初始条件)<br>
替代公式（不显含时间t时）：a = v·dv/dx（链式法则）<br>
匀加速时：v² = v₀² + 2a(x - x₀)
</div>

<h2>2.1.2 直角坐标系</h2>
<div class="formula">
r = x(t)·i + y(t)·j + z(t)·k<br>
v = dx/dt·i + dy/dt·j + dz/dt·k<br>
a = d²x/dt²·i + d²y/dt²·j + d²z/dt²·k
</div>
<div class="derive">
<strong>关键：x, y, z 各分量完全独立！</strong><br>
这就是为什么抛体运动好算：x方向匀速（ax=0），y方向匀加速（ay=-g）。
</div>

<h2>2.1.3 极坐标系 ★ 重点难点</h2>
<p>当质点绕某点运动时（如雷达跟踪、旋转臂上的滑块），用极坐标 (r, θ) 比直角坐标更方便。</p>

<h3>坐标系定义</h3>
<div class="formula">
r(t) = 极径，质点到原点O的距离<br>
θ(t) = 极角，质点相对于参考方向的角度<br>
e<sub>r</sub>(t) = 径向单位向量，沿r方向<br>
e<sub>θ</sub>(t) = 横向单位向量，垂直于r，指向θ增大方向
</div>
<div class="key">
<strong>★ 与直角坐标的根本区别：</strong><br>
直角坐标的i、j是<strong>固定不变</strong>的；<br>
极坐标的e<sub>r</sub>、e<sub>θ</sub>是<strong>随时间旋转</strong>的（模不变但方向在变）！<br>
这是极坐标推导中所有额外项的来源。
</div>

<h3>位置向量</h3>
<div class="formula">
<strong>r = r(t) · e<sub>r</sub>(t)</strong>
</div>

<h3>速度推导 ★ 完整过程</h3>
<div class="derive">
<strong>Step 1 — 对位置向量求导（乘法法则）</strong><br>
r = r(t)·e<sub>r</sub>(t) 是两个函数的乘积：<br>
v = dr/dt = (dr/dt)·e<sub>r</sub> + r·(de<sub>r</sub>/dt) &nbsp;&nbsp; ...(*)
</div>
<div class="derive">
<strong>Step 2 — 求 de<sub>r</sub>/dt（关键步骤）</strong><br>
在时刻t，e<sub>r</sub>在角度θ的位置。在时刻t+Δt，e<sub>r</sub>旋转了Δθ。<br>
因为e<sub>r</sub>是<strong>单位向量</strong>（模=1），旋转后模不变，Δe<sub>r</sub>的方向 = <strong>e<sub>θ</sub>方向</strong>。<br>
由等腰三角形关系：|Δe<sub>r</sub>| = 2·sin(Δθ/2)<br>
取极限：|de<sub>r</sub>/dt| = lim[sin(Δθ/2)/(Δθ/2)] · lim[Δθ/Δt] = 1 · dθ/dt = ω<br>
<strong>de<sub>r</sub>/dt = ω · e<sub>θ</sub></strong>（课件也写作 de<sub>r</sub>/dt = ω × e<sub>r</sub>）
</div>
<div class="derive">
<strong>Step 3 — 代入得到速度公式</strong><br>
v = ṙ·e<sub>r</sub> + rω·e<sub>θ</sub>
</div>
<div class="formula">
<strong>v = ṙ·e<sub>r</sub> + rω·e<sub>θ</sub></strong>
</div>

<h3>加速度推导 ★ 完整过程</h3>
<div class="derive">
<strong>Step 1 — 对速度求导</strong><br>
对 ṙ·e<sub>r</sub> 求导 → r̈·e<sub>r</sub> + ṙ·(de<sub>r</sub>/dt) = r̈·e<sub>r</sub> + ṙω·e<sub>θ</sub><br>
对 rω·e<sub>θ</sub> 求导 → (ṙω + rα)·e<sub>θ</sub> + rω·(de<sub>θ</sub>/dt)
</div>
<div class="derive">
<strong>Step 2 — 求 de<sub>θ</sub>/dt</strong><br>
类似de<sub>r</sub>/dt的推导，e<sub>θ</sub>旋转后变化方向 = <strong>-e<sub>r</sub>方向</strong>（指向圆心）<br>
<strong>de<sub>θ</sub>/dt = -ω · e<sub>r</sub></strong>
</div>
<div class="derive">
<strong>Step 3 — 合并</strong><br>
e<sub>r</sub>分量：r̈ - rω²<br>
e<sub>θ</sub>分量：ṙω + ṙω + rα = rα + 2ṙω
</div>
<div class="formula">
<strong>a = (r̈ - rω²)·e<sub>r</sub> + (rα + 2ṙω)·e<sub>θ</sub></strong>
</div>

<h3>加速度四项的物理意义</h3>
<table>
<tr><th>项</th><th>方向</th><th>名称</th><th>物理含义</th></tr>
<tr><td>r̈</td><td>径向</td><td>径向加速度</td><td>径向速度大小的变化</td></tr>
<tr><td><strong>-rω²</strong></td><td>径向</td><td><strong>向心加速度</strong></td><td><strong>始终指向原点</strong>，改变速度方向</td></tr>
<tr><td>rα</td><td>横向</td><td>切向加速度</td><td>角速度变化引起</td></tr>
<tr><td><strong>2ṙω</strong></td><td>横向</td><td><strong>科里奥利加速度</strong></td><td>径向运动+旋转的<strong>耦合效应</strong></td></tr>
</table>
<div class="key">
<strong>★ -rω² 的负号不能丢！</strong>它表示向心加速度永远指向原点。<br>
<strong>★ 科里奥利加速度 2ṙω 只在 ṙ≠0 且 ω≠0 时出现。</strong>
</div>

<div class="example">
<div class="example-title">例题：旋转臂上的滑块（来自课件 Practice Problem 3）</div>
<p><strong>题目：</strong>θ = 0.2t + 0.02t³ (rad)，r = 0.2 + 0.04t² (m)。求 t=3s 时的速度和加速度大小。</p>
<p><strong>Step 1 — 求导：</strong>r = 0.2+0.04t² → ṙ=0.08t, r̈=0.08 | θ = 0.2t+0.02t³ → ω=0.2+0.06t², α=0.12t</p>
<p><strong>Step 2 — t=3s：</strong>r=0.56m, ṙ=0.24m/s, r̈=0.08, ω=0.74rad/s, α=0.36rad/s²</p>
<p><strong>Step 3 — 速度：</strong>v<sub>r</sub>=0.24, v<sub>θ</sub>=rω=0.56×0.74=0.414 | |v|=√(0.24²+0.414²)=<strong>0.48 m/s</strong></p>
<p><strong>Step 4 — 加速度：</strong>a<sub>r</sub>=0.08-0.56×0.74²=-0.227, a<sub>θ</sub>=0.56×0.36+2×0.24×0.74=0.557 | |a|=<strong>0.60 m/s²</strong></p>
</div>

<h2>2.1.4 自然坐标系 ★</h2>
<p>已知轨迹曲线时最方便。速度只有切向分量（质点被约束在轨迹上）。</p>
<div class="formula">
v = v·e<sub>t</sub> &nbsp;&nbsp; (速度只有切向分量)<br>
a = a<sub>t</sub>·e<sub>t</sub> + a<sub>n</sub>·e<sub>n</sub><br>
a<sub>t</sub> = dv/dt &nbsp;&nbsp; (速度大小的变化率)<br>
a<sub>n</sub> = v²/ρ = ρω² &nbsp;&nbsp; (速度方向的变化率, ρ=曲率半径)
</div>
<div class="derive">
<strong>课件推导 a<sub>n</sub> = v²/ρ：</strong><br>
在小距离ds内，曲线可近似为圆弧，ds = ρ·dθ<br>
v = ds/dt = ρ·(dθ/dt) = ρω<br>
法向加速度 = v²/ρ = ρω²（向心加速度）
</div>

<h2>2.1.5 圆周运动（极坐标和自然坐标的特例）</h2>
<div class="formula">
v = rω &nbsp;&nbsp; (r=常数 → ṙ=0，只有横向速度)<br>
a<sub>t</sub> = rα &nbsp;&nbsp; (切向加速度)<br>
a<sub>n</sub> = rω² = v²/r &nbsp;&nbsp; (向心加速度)
</div>
<div class="derive">
<strong>两种坐标系给出相同结果：</strong><br>
极坐标：ṙ=0 → v=rωu<sub>θ</sub>, a=-rω²u<sub>r</sub>+rαu<sub>θ</sub><br>
自然坐标：v=rωu<sub>t</sub>, a<sub>t</sub>=rα, a<sub>n</sub>=rω²<br>
只是分解方向不同（u<sub>θ</sub>=u<sub>t</sub>, -u<sub>r</sub>=u<sub>n</sub>），结果完全一致。
</div>

<div class="example">
<div class="example-title">例题：圆周运动综合（课件练习）</div>
<p><strong>题目：</strong>质点沿R=2m的圆周运动，弧长s(t)=3t²。求t=1s时的速度和加速度。</p>
<p>v = ds/dt = 6t = 6 m/s<br>
a<sub>t</sub> = dv/dt = 6 m/s²（切向，速度大小在增加）<br>
a<sub>n</sub> = v²/R = 36/2 = 18 m/s²（法向，改变速度方向）<br>
|a| = √(36 + 324) = √360 ≈ <strong>19.0 m/s²</strong></p>
<p><strong>注意：</strong>a<sub>n</sub>远大于a<sub>t</sub>，说明主要是在"转弯"而不是"加速"。</p>
</div>
""")

print("Part 1 done: Ch1 + Ch2.1")

# ============================================================
# CHAPTER 2.2: RIGID BODY KINEMATICS
# ============================================================
html.append("""
<h1>Chapter 2.2: Kinematics of Solid Bodies 刚体运动学</h1>

<h2>2.2.1 核心思想</h2>
<p>刚体运动学要解决的核心问题是：<strong>已知刚体上某些点的运动，求其他点的运动。</strong></p>
<p>三种基本运动类型：平动、定轴转动、一般运动（平动+转动）。</p>

<h2>2.2.2 平动</h2>
<div class="key">
<strong>★ 平动的本质（课件）：</strong><br>
刚体上所有点在同一时刻的速度和加速度完全相同。<br>
即 vA = vB, aA = aB（对刚体上任意两点A、B）
</div>

<h2>2.2.3 定轴转动 ★ 重要推导</h2>
<div class="formula">
v<sub>B</sub> = ω × r<sub>B</sub><br>
|v<sub>B</sub>| = ω · d &nbsp;&nbsp; (d = B到转轴的垂直距离)
</div>
<div class="derive">
<strong>课件推导 v = ω × r 的完整过程：</strong><br><br>
设转轴沿z方向，ω = ωk。B点固定在刚体上（xB, yB, zB为常数）：<br>
r<sub>B</sub> = x<sub>B</sub>i + y<sub>B</sub>j + z<sub>B</sub>k<br><br>
速度 v<sub>B</sub> = dr<sub>B</sub>/dt = x<sub>B</sub>(di/dt) + y<sub>B</sub>(dj/dt) + z<sub>B</sub>(dk/dt)<br><br>
关键：旋转坐标系中单位向量的时间导数：<br>
di/dt = ω × i = ωk × i = ωj<br>
dj/dt = ω × j = ωk × j = -ωi<br>
dk/dt = ω × k = 0<br><br>
所以：v<sub>B</sub> = x<sub>B</sub>·ωj + y<sub>B</sub>·(-ωi) = -ωy<sub>B</sub>i + ωx<sub>B</sub>j<br><br>
验证叉积：ωk × (x<sub>B</sub>i + y<sub>B</sub>j) = ωx<sub>B</sub>j - ωy<sub>B</sub>i ✓<br>
大小：|v<sub>B</sub>| = ω√(x<sub>B</sub>² + y<sub>B</sub>²) = ωd ✓
</div>
<div class="key">
<strong>★ 定轴转动的性质：</strong><br>
① 所有点的轨迹是圆（在垂直于转轴的平面内）<br>
② 速度大小与到轴的距离成正比（三角形分布）<br>
③ 转轴上的点速度为零
</div>

<h2>2.2.4 平面一般运动 ★★★ 最重要的公式</h2>
<div class="key">
<strong>★★★ 核心公式：</strong><br>
<strong>v<sub>B</sub> = v<sub>A</sub> + ω × r<sub>B/A</sub></strong><br>
<strong>a<sub>B</sub> = a<sub>A</sub> + α × r<sub>B/A</sub> - ω²·r<sub>B/A</sub></strong>
</div>
<div class="derive">
<strong>课件推导 - 速度公式：</strong><br>
任意一般运动 = A点的平动 + 绕A的转动<br>
r<sub>B</sub> = r<sub>A</sub> + r<sub>B/A</sub><br>
对时间求导：v<sub>B</sub> = v<sub>A</sub> + d(r<sub>B/A</sub>)/dt = v<sub>A</sub> + ω × r<sub>B/A</sub>
</div>
<div class="derive">
<strong>课件推导 - 加速度公式（Revision p.21 完整推导）：</strong><br>
a<sub>B</sub> = d(v<sub>B</sub>)/dt = d(v<sub>A</sub>)/dt + d(ω × r<sub>B/A</sub>)/dt<br>
&nbsp;&nbsp; = a<sub>A</sub> + (dω/dt) × r<sub>B/A</sub> + ω × (d(r<sub>B/A</sub>)/dt)<br>
&nbsp;&nbsp; = a<sub>A</sub> + α × r<sub>B/A</sub> + ω × (ω × r<sub>B/A</sub>)<br><br>
在2D中：ω × (ω × r<sub>B/A</sub>) = -ω²r<sub>B/A</sub><br>
最终：a<sub>B</sub> = a<sub>A</sub> + α × r<sub>B/A</sub> - ω²r<sub>B/A</sub><br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;平动 &nbsp;&nbsp;&nbsp;&nbsp; 切向(α) &nbsp;&nbsp;&nbsp;&nbsp; 向心(-ω²)
</div>
<div class="tip">
<strong>常见错误：</strong>-ω²r<sub>B/A</sub>项指向A点（从B指向A）。负号不能丢！
</div>

<h2>2.2.5 瞬时转动中心 ★</h2>
<p>在某一瞬间，刚体上总存在一个速度为零的点I。找到瞬心后，问题简化为定轴转动。</p>
<div class="derive">
<strong>找瞬心的方法：</strong><br>
① 已知A、B两点速度方向<br>
② 过A作v<sub>A</sub>的垂线，过B作v<sub>B</sub>的垂线<br>
③ 两垂线交点 = 瞬心I<br>
④ v<sub>B</sub> = ω × r<sub>B/I</sub>
</div>
<div class="key">
<strong>★ 瞬心的加速度一般不为零！</strong>瞬心只保证该瞬间速度为零。
</div>

<h2>2.2.6 动参考系 ★</h2>
<div class="formula">
v<sub>a</sub> = v<sub>e</sub> + ω × r + v<sub>r</sub><br>
a<sub>a</sub> = a<sub>e</sub> + α×r + ω×(ω×r) + a<sub>r</sub> + 2ω×v<sub>r</sub>
</div>
<div class="derive">
<strong>各项含义：</strong><br>
• v<sub>a</sub>（绝对）：固定系中观察到的速度<br>
• v<sub>e</sub>（牵连）：动系原点的速度<br>
• ω × r：动系转动引起的附加速度<br>
• v<sub>r</sub>（相对）：在动系中观察到的速度<br>
• <strong>2ω×v<sub>r</sub> = 科里奥利加速度</strong>
</div>

<div class="example">
<div class="example-title">例题：定轴转动-叉积计算</div>
<p><strong>题目：</strong>齿轮绕z轴旋转，ω=10k rad/s，B点坐标(0.1, 0.2, 0.3)m，求B点速度。</p>
<p>v<sub>B</sub> = ω × r<sub>B</sub> = 10k × (0.1i + 0.2j + 0.3k)<br>
= 10×0.1(k×i) + 10×0.2(k×j) = 1.0j - 2.0i = <strong>(-2.0i + 1.0j) m/s</strong><br>
|v<sub>B</sub>| = √(4+1) = √5 ≈ 2.24 m/s</p>
<p>验证：d = √(0.1² + 0.2²) = 0.224m, v = ωd = 10×0.224 = 2.24 ✓</p>
</div>
""")

# ============================================================
# CHAPTER 3.1: PARTICLE DYNAMICS
# ============================================================
html.append("""
<h1>Chapter 3.1: Dynamics of Particles 质点动力学</h1>

<h2>3.1.1 核心思想</h2>
<p>动力学 = 运动 + 力。核心问题：<strong>力如何影响运动？</strong></p>
<div class="key">
<strong>★ 牛顿第二定律 F = ma — 整章的基础</strong>
</div>
<div class="derive">
<strong>课件推导 - 从F=ma到三大定理：</strong><br>
F = ma = m(dv/dt) = d(mv)/dt = dH/dt（线动量定理）<br>
r × F = r × ma = d(r × mv)/dt = dK/dt（角动量定理）<br>
∫F·dr = ∫ma·dr = ∫mv dv = ½mv₂² - ½mv₁²（动能定理）
</div>

<h2>3.1.2 线动量定理</h2>
<div class="formula">
H = mv &nbsp;&nbsp; (线动量)<br>
ΣF = dH/dt = d(mv)/dt<br>
冲量：∫(t₁→t₂) F dt = mv₂ - mv₁
</div>

<h2>3.1.3 角动量定理</h2>
<div class="formula">
K = r × mv &nbsp;&nbsp; (角动量)<br>
ΣM = dK/dt<br>
角冲量：∫(t₁→t₂) M dt = K₂ - K₁
</div>

<h2>3.1.4 功-动能定理</h2>
<div class="formula">
T = ½mv² &nbsp;&nbsp; (动能)<br>
W₁₂ = ∫F·dr = T₂ - T₁
</div>
<div class="derive">
<strong>推导：</strong>∫F·dr = ∫m(dv/dt)·dr = ∫m·v·dv = ½mv₂² - ½mv₁²
</div>

<h3>三大定理选择指南</h3>
<table>
<tr><th>已知条件</th><th>求解目标</th><th>选择定理</th></tr>
<tr><td>力是时间函数</td><td>速度变化</td><td>动量定理（冲量=Δp）</td></tr>
<tr><td>力是位移函数</td><td>速度大小</td><td>动能定理（W=ΔT）</td></tr>
<tr><td>绕某点转动</td><td>角速度变化</td><td>角动量定理</td></tr>
<tr><td>力是常数</td><td>任意</td><td>F=ma最直接</td></tr>
</table>

<h2>3.1.5 质心运动定理 ★</h2>
<div class="formula">
r<sub>C</sub> = Σ(m<sub>i</sub>r<sub>i</sub>) / M<br>
<strong>ΣF<sub>ext</sub> = M·a<sub>C</sub></strong>
</div>
<div class="derive">
<strong>推导：</strong>对每个粒子 Fi = mi·ai，求和：ΣFi = Σ(mi·ai) = M·a<sub>C</sub><br>
内力成对抵消，只有外力影响质心运动。
</div>

<div class="example">
<div class="example-title">例题：轨道粒子受力分析（课件 Practice Problem 2）</div>
<p><strong>题目：</strong>粒子受力始终垂直于速度，F=λmv。求轨迹。</p>
<p>切向：F<sub>t</sub>=0 → v=常数。法向：F<sub>n</sub>=λmv=mv²/ρ → ρ=v/λ=常数<br>
ρ=常数 → <strong>轨迹是圆，匀速圆周运动。</strong></p>
</div>
""")

# ============================================================
# CHAPTER 3.2: RIGID BODY DYNAMICS
# ============================================================
html.append("""
<h1>Chapter 3.2: Dynamics of Solid Bodies 刚体动力学</h1>

<h2>3.2.1 质心</h2>
<div class="formula">
离散：r<sub>C</sub> = Σ(m<sub>i</sub>r<sub>i</sub>) / Σm<sub>i</sub><br>
连续（3D均匀）：x<sub>C</sub> = ∫x dV / ∫dV
</div>

<h2>3.2.2 转动惯量 ★★★ 完整推导</h2>
<div class="formula">
I = ∫r² dm &nbsp;&nbsp; (r = 到转轴的垂直距离)
</div>
<div class="derive">
<strong>物理意义：</strong>I 是物体抵抗角加速度的能力。F=ma 对应 M=Iα。<br>
I越大 → 同样力矩下角加速度越小。质量分布离轴越远，I越大。
</div>

<h3>矩形板的I推导（课件 Example 1）</h3>
<div class="derive">
<strong>对底边x轴：</strong><br>
取微元条dy（宽b），dm = (m/bh)·b·dy = (m/h)dy<br>
I<sub>Ox</sub> = ∫₀ʰ y²·(m/h)dy = (m/h)·h³/3 = <strong>mh²/3</strong><br><br>
<strong>对过质心的平行轴：</strong><br>
I<sub>C</sub> = (m/h)∫₋ₕ/₂^{h/2} y² dy = <strong>mh²/12</strong>
</div>

<h3>细杆的I推导（课件 Example 2）</h3>
<div class="derive">
对端点：I = (m/L)∫₀ᴸ y² dy = <strong>mL²/3</strong><br>
对中点：I<sub>C</sub> = (m/L)∫₋ₗ/₂^{L/2} y² dy = <strong>mL²/12</strong>
</div>

<h3>圆盘的I推导（课件 Example 3）</h3>
<div class="derive">
<strong>对直径：</strong>dm = (m/πR²)r dr dθ<br>
I<sub>Ox</sub> = (m/πR²)∫₀ᴿ r³ dr ∫₀²π sin²θ dθ = (m/πR²)·(R⁴/4)·π = <strong>mR²/4</strong><br><br>
<strong>对垂直轴：</strong>I<sub>Oz</sub> = I<sub>Ox</sub> + I<sub>Oy</sub> = mR²/4 + mR²/4 = <strong>mR²/2</strong>
</div>

<h3>常用转动惯量表</h3>
<table>
<tr><th>形状</th><th>对质心轴</th><th>对其他轴</th></tr>
<tr><td>细杆（长L）</td><td>I<sub>c</sub> = mL²/12</td><td>端点：mL²/3</td></tr>
<tr><td>圆盘（半径R）</td><td>直径：mR²/4</td><td>垂直轴：mR²/2</td></tr>
<tr><td>矩形板（高h）</td><td>I<sub>c</sub> = mh²/12</td><td>底边：mh²/3</td></tr>
</table>

<h2>3.2.3 平行轴定理 ★★★ 必考 完整证明</h2>
<div class="key">
<strong>★★★ I<sub>Δ</sub> = I<sub>ΔC</sub> + md²</strong>
</div>
<div class="derive">
<strong>课件证明（p.47-49）：</strong><br>
设Oxyz固定系，Cx₁y₁z₁过质心的平行系。任意dm：r = r<sub>C</sub> + r₁<br>
即 x = x<sub>C</sub> + x₁, y = y<sub>C</sub> + y₁<br><br>
I<sub>Ox</sub> = ∫(y² + z²)dm<br>
= ∫[(y<sub>C</sub>+y₁)² + (z<sub>C</sub>+z₁)²]dm<br>
= ∫(y₁²+z₁²)dm + 2y<sub>C</sub>∫y₁dm + 2z<sub>C</sub>∫z₁dm + (y<sub>C</sub>²+z<sub>C</sub>²)m<br>
= I<sub>Cx₁</sub> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; + 0 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; + 0 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; + d²m<br><br>
中间两项为零因为<strong>质心定义</strong>：∫y₁dm = 0<br>
<strong>I<sub>Ox</sub> = I<sub>Cx₁</sub> + md²</strong> ✓
</div>

<div class="example">
<div class="example-title">例题：组合体转动惯量（课件 Practice Problem 2）</div>
<p><strong>题目：</strong>杆(3kg,0.6m) + 圆盘(2kg,R=0.2m)。求对过组合体质心的垂直轴的I。</p>
<p>x<sub>C</sub> = (3×0.3 + 2×0.8)/5 = 0.5m<br>
杆：I<sub>L</sub> = 3×0.6²/12 + 3×0.2² = 0.09 + 0.12 = 0.21 kg·m²<br>
盘：I<sub>D</sub> = 2×0.2²/2 + 2×0.3² = 0.04 + 0.18 = 0.22 kg·m²<br>
<strong>I<sub>total</sub> = 0.43 kg·m²</strong></p>
</div>

<h2>3.2.4 刚体三大定理</h2>
<div class="formula">
1. 线动量：ΣF = Ma<sub>C</sub><br>
2. 角动量：K<sub>O</sub> = I<sub>C</sub>ω + Mr<sub>C</sub>×v<sub>C</sub>, &nbsp; ΣM<sub>C</sub> = I<sub>C</sub>α<br>
3. 动能：T = ½Mv<sub>C</sub>² + ½I<sub>C</sub>ω²
</div>
<div class="derive">
<strong>动能 = 平动 + 转动：</strong><br>
纯平动：T = ½Mv² &nbsp; 纯转动：T = ½Iω² &nbsp; 一般：两项都有
</div>

<div class="example">
<div class="example-title">例题：鼓轮-斜面系统（课件 Practice Problem 3）</div>
<p><strong>题目：</strong>50kg箱子经r=0.15m鼓轮拉上20°斜面。I=4.8kg·m², μ=0.35, M=52Nm。求a。</p>
<p>箱子(沿斜面)：T - mg sin20° - μmg cos20° = ma &nbsp; ...(1)<br>
鼓轮：M - Tr = Iα &nbsp; ...(2)<br>
运动学：a = rα &nbsp; ...(3)<br>
联立：a = (M/r - mg sin20° - μmg cos20°)/(m + I/r²) = <strong>0.068 m/s²</strong></p>
</div>
""")

# ============================================================
# CHAPTER 4.1: MECHANISMS
# ============================================================
html.append("""
<h1>Chapter 4.1: Mechanisms 机构学</h1>

<h2>4.1.1 核心概念</h2>
<p><strong>机器组件 → 机构 → 机器</strong><br>
机器组件：最基本的零件。机构：多个组件连接，传递运动和力（可变形）。机器：机构+动力源。</p>

<h2>4.1.2 自由度 ★ 核心公式</h2>
<div class="key">
<strong>★ Gruebler方程：M = 3(n-1) - 2p₅ - p₄</strong><br>
n = 构件数（含机架），p₅ = 1自由度运动副数，p₄ = 2自由度运动副数
</div>
<div class="derive">
<strong>公式推导（课件 p.16）：</strong><br>
n个构件在2D中总自由度 = 3n<br>
固定机架去掉3个DOF → 3(n-1)<br>
每个class 5副约束2个DOF → 减去2p₅<br>
每个class 4副约束1个DOF → 减去p₄
</div>

<h3>运动副分类（课件 p.15）</h3>
<table>
<tr><th>副</th><th>Class</th><th>自由度</th><th>例子</th></tr>
<tr><td>转动副(R)</td><td>5</td><td>1旋转</td><td>铰链、轴承</td></tr>
<tr><td>移动副(P)</td><td>5</td><td>1平移</td><td>滑块、导轨</td></tr>
<tr><td>圆柱副(C)</td><td>4</td><td>1转+1移</td><td>活塞缸</td></tr>
<tr><td>球面副(S)</td><td>3</td><td>3旋转</td><td>球铰</td></tr>
</table>

<h3>自由度含义</h3>
<table>
<tr><th>M值</th><th>含义</th></tr>
<tr><td>M > 0</td><td>需要M个驱动件</td></tr>
<tr><td>M = 0</td><td>静定结构（桁架/刚架）</td></tr>
<tr><td>M < 0</td><td>超静定结构</td></tr>
</table>

<h2>4.1.3 机构静力学</h2>
<div class="tip">
<strong>三个解题工具：</strong><br>
① <strong>固化法</strong>：整体当刚体 → 求外力<br>
② <strong>截面法</strong>：切开暴露内力<br>
③ <strong>分离法</strong>：隔离单个构件画FBD
</div>

<div class="example">
<div class="example-title">例题1：挖掘机臂（课件 Practice Problem 1）</div>
<p>W=1600N, BD水平, AB=0.8m, BC总长含铲斗=2.4m</p>
<p>BD是二力构件 → 水平力。对A取矩：<br>
FBD×0.8 = 1600×2.4 → <strong>FBD = 4800 N</strong><br>
力平衡：XA=4800N, YA=1600N, |FA|=<strong>5060 N</strong></p>
</div>

<div class="example">
<div class="example-title">例题2：四连杆求扭矩（课件 Practice Problem 2）</div>
<p>F=100N在A点，OA和AB为二力构件。BC=0.3m。</p>
<p>分离A：力平衡求FOA=78N, FAB=-103.4N(受压)<br>
分离BC，对C取矩：τ = 103.4×sin45°×0.3 = <strong>21.9 Nm</strong></p>
</div>

<h2>4.1.4 机构运动学</h2>
<p>已知驱动件运动 → 求其他构件的速度和加速度。核心工具是 v<sub>B</sub>=v<sub>A</sub>+ω×r<sub>B/A</sub> 和动参考系法。</p>

<div class="example">
<div class="example-title">例题：牛头刨床机构（课件 Practice Problem 3）</div>
<p>OA绕O转动(ω=10rad/s), OA=0.1m, CB=0.6m。求B点速度。</p>
<p>各构件运动类型：OA=转动, CB=转动, 滑块A=一般运动, 滑块D=平动<br>
用动参考系法：v<sub>a</sub> = v<sub>e</sub> + ω₁×r + v<sub>r</sub><br>
① v<sub>a</sub> = ω<sub>OA</sub>×r<sub>OA</sub>（绝对速度）<br>
② v<sub>e</sub> = ω<sub>CB</sub>×r<sub>CA</sub>（牵连速度）<br>
③ v<sub>r</sub>沿滑槽方向（相对速度）<br>
列方程求解ω<sub>CB</sub>，然后v<sub>B</sub> = ω<sub>CB</sub>×r<sub>CB</sub></p>
</div>
""")

# ============================================================
# CHAPTER 4.2: ROBOTS
# ============================================================
html.append("""
<h1>Chapter 4.2: Robots 机器人学</h1>

<h2>4.2.1 机构 vs 机器人</h2>
<p>机构：执行固定重复任务。机器人：可编程，有传感器、控制器、执行器。</p>

<h2>4.2.2 正运动学 ★★★ 必考</h2>
<div class="key">
<strong>★ 2连杆正运动学：</strong><br>
x<sub>e</sub> = l₁cosθ₁ + l₂cos(θ₁+θ₂)<br>
y<sub>e</sub> = l₁sinθ₁ + l₂sin(θ₁+θ₂)
</div>
<div class="derive">
<strong>推导：</strong><br>
第一个连杆末端：x₁ = l₁cosθ₁, y₁ = l₁sinθ₁<br>
第二个连杆相对第一个的夹角是θ₂ → 绝对角度 = θ₁+θ₂<br>
第二个连杆末端：Δx = l₂cos(θ₁+θ₂), Δy = l₂sin(θ₁+θ₂)<br>
总位置 = 第一杆末端 + 相对偏移
</div>

<h2>4.2.3 逆运动学 ★★★ 必考</h2>
<div class="key">
<strong>★ cosθ₂ = (x² + y² - l₁² - l₂²) / (2l₁l₂)</strong>
</div>
<div class="derive">
<strong>推导（课件 p.33）：</strong><br>
从正运动学平方相加：<br>
x² + y² = l₁² + l₂² + 2l₁l₂cosθ₂（余弦定理）<br>
解出cosθ₂。注意<strong>通常有两个解</strong>（肘上/肘下）。
</div>
<div class="derive">
<strong>求θ₁（课件 p.34）：</strong><br>
引入角度α = arctan(y/x)和β角<br>
θ₁A = α - β（肘下），θ₁B = α + β（肘上）
</div>

<h2>4.2.4 雅可比矩阵 ★ 完整推导</h2>
<div class="formula">
dX = J·dθ &nbsp;&nbsp; (dX = [dx<sub>e</sub>, dy<sub>e</sub>]<sup>T</sup>, dθ = [dθ₁, dθ₂]<sup>T</sup>)
</div>
<div class="derive">
<strong>推导过程（课件 p.41-50）：</strong><br><br>
从正运动学：<br>
x<sub>e</sub> = l₁cosθ₁ + l₂cos(θ₁+θ₂)<br>
y<sub>e</sub> = l₁sinθ₁ + l₂sin(θ₁+θ₂)<br><br>
对x<sub>e</sub>和y<sub>e</sub>取全微分：<br>
dx<sub>e</sub> = (∂x<sub>e</sub>/∂θ₁)dθ₁ + (∂x<sub>e</sub>/∂θ₂)dθ₂<br>
dy<sub>e</sub> = (∂y<sub>e</sub>/∂θ₁)dθ₁ + (∂y<sub>e</sub>/∂θ₂)dθ₂<br><br>
写成矩阵形式 dX = J·dθ：<br><br>
J = [[∂x/∂θ₁, ∂x/∂θ₂],<br>
&nbsp;&nbsp;&nbsp;&nbsp; [∂y/∂θ₁, ∂y/∂θ₂]]<br><br>
用简记 s₁=sinθ₁, c₁=cosθ₁, s₁₂=sin(θ₁+θ₂), c₁₂=cos(θ₁+θ₂)：<br><br>
<strong>J = [[-l₁s₁-l₂s₁₂, -l₂s₁₂],<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; [l₁c₁+l₂c₁₂, &nbsp;&nbsp;&nbsp;l₂c₁₂]]</strong>
</div>

<h2>4.2.5 静力学：τ = J<sup>T</sup>F ★ 完整推导</h2>
<div class="key">
<strong>★ τ = J<sup>T</sup>·F</strong>（关节力矩 = 雅可比转置 × 末端力）
</div>
<div class="derive">
<strong>课件推导（p.19-23）- 从FBD到τ=J<sup>T</sup>F：</strong><br><br>
<strong>Step 1 — 对O取矩求τ₁：</strong><br>
隔离整个机械臂，对O取矩：<br>
τ₁ = -Fx[l₁sinθ₁+l₂sin(θ₁+θ₂)] + Fy[l₁cosθ₁+l₂cos(θ₁+θ₂)]<br><br>
<strong>Step 2 — 对A取矩求τ₂：</strong><br>
隔离连杆AB，对A取矩：<br>
τ₂ = -Fx·l₂sin(θ₁+θ₂) + Fy·l₂cos(θ₁+θ₂)<br><br>
<strong>Step 3 — 写成矩阵形式：</strong><br>
τ = [[-l₂s₁₂, l₂c₁₂], [-l₁s₁-l₂s₁₂, l₁c₁+l₂c₁₂]] · [Fx, Fy]<sup>T</sup><br><br>
系数矩阵恰好 = <strong>J<sup>T</sup></strong>（雅可比矩阵的转置）✓<br><br>
<strong>物理意义：</strong>虚功原理：关节虚功 = 末端虚功<br>
τ<sup>T</sup>dθ = F<sup>T</sup>dX = F<sup>T</sup>Jdθ → τ = J<sup>T</sup>F
</div>
<div class="key">
<strong>★ 奇异位置：det(J)=0 时机器人失去某个方向的运动能力！</strong>
</div>

<h2>4.2.6 工作空间</h2>
<div class="formula">
最大半径 = l₁ + l₂（完全伸展）<br>
最小半径 = |l₁ - l₂|（完全折叠）<br>
工作空间 = 环形区域
</div>

<div class="example">
<div class="example-title">例题：正运动学 + 雅可比 + 静力学综合</div>
<p><strong>题目：</strong>2连杆，l₁=0.4m, l₂=0.3m, θ₁=30°, θ₂=45°。末端受力F=(10,-20)N。求关节力矩。</p>
<p><strong>Step 1 — 正运动学：</strong><br>
x = 0.4cos30° + 0.3cos75° = 0.346 + 0.078 = 0.424m<br>
y = 0.4sin30° + 0.3sin75° = 0.200 + 0.290 = 0.490m</p>
<p><strong>Step 2 — 雅可比：</strong><br>
J = [[-0.4sin30°-0.3sin75°, -0.3sin75°],<br>
&nbsp;&nbsp;&nbsp;&nbsp; [0.4cos30°+0.3cos75°, 0.3cos75°]]<br>
= [[-0.490, -0.290], [0.424, 0.078]]</p>
<p><strong>Step 3 — τ = J<sup>T</sup>F：</strong><br>
τ₁ = (-0.490)(10) + (0.424)(-20) = -4.90 - 8.48 = <strong>-13.38 Nm</strong><br>
τ₂ = (-0.290)(10) + (0.078)(-20) = -2.90 - 1.56 = <strong>-4.46 Nm</strong></p>
</div>
""")

# ============================================================
# FORMULA SHEET
# ============================================================
html.append("""
<h1>附录：公式速查表</h1>

<h2>静力学</h2>
<div class="formula">
Fx=Fcosθ, Fy=Fsinθ | M=r×F (叉积), M=Fd (标量)<br>
平衡: ΣF=0, ΣM=0 | 摩擦: F=μN, 临界角α=arctan(μ)
</div>

<h2>质点运动学</h2>
<div class="formula">
v=dr/dt, a=dv/dt<br>
直角: v=ẋi+ẏj+żk, a=ẍi+ÿj+z̈k<br>
极坐标: v=ṙe<sub>r</sub>+rωe<sub>θ</sub>, a=(r̈-rω²)e<sub>r</sub>+(rα+2ṙω)e<sub>θ</sub><br>
自然: a<sub>t</sub>=dv/dt, a<sub>n</sub>=v²/ρ<br>
圆周: v=rω, a<sub>t</sub>=rα, a<sub>n</sub>=rω²=v²/r
</div>

<h2>刚体运动学</h2>
<div class="formula">
平动: v<sub>A</sub>=v<sub>B</sub><br>
定轴: v=ω×r, |v|=ωd<br>
一般: v<sub>B</sub>=v<sub>A</sub>+ω×r<sub>B/A</sub>, a<sub>B</sub>=a<sub>A</sub>+α×r<sub>B/A</sub>-ω²r<sub>B/A</sub><br>
瞬心: v<sub>B</sub>=ω×r<sub>B/I</sub><br>
动系: v<sub>a</sub>=v<sub>e</sub>+ω×r+v<sub>r</sub>, a<sub>a</sub>=a<sub>e</sub>+α×r+ω×(ω×r)+a<sub>r</sub>+2ω×v<sub>r</sub>
</div>

<h2>质点动力学</h2>
<div class="formula">
F=ma | p=mv, T=½mv² | K=r×mv<br>
动量: ΣF=dp/dt, 冲量=Δp<br>
角动量: ΣM=dK/dt<br>
质心: r<sub>C</sub>=Σm<sub>i</sub>r<sub>i</sub>/M, ΣF<sub>ext</sub>=Ma<sub>C</sub>
</div>

<h2>刚体动力学</h2>
<div class="formula">
I=∫r²dm | 平行轴: I=I<sub>c</sub>+md²<br>
Rod: mL²/12(center), mL²/3(end) | Disc: mR²/2(perp), mR²/4(dia)<br>
T=½Mv<sub>C</sub>²+½I<sub>C</sub>ω² | ΣM<sub>C</sub>=I<sub>C</sub>α
</div>

<h2>机构与机器人</h2>
<div class="formula">
自由度: M=3(n-1)-2p₅-p₄<br>
正运动学: x=l₁cosθ₁+l₂cos(θ₁+θ₂), y=l₁sinθ₁+l₂sin(θ₁+θ₂)<br>
逆运动学: cosθ₂=(x²+y²-l₁²-l₂²)/(2l₁l₂)<br>
雅可比: ẋ=Jθ̇, τ=J<sup>T</sup>F | 奇异: det(J)=0
</div>

<h2>考试建议（来自Revision课件）</h2>
<ul>
<li>① 理解原理比死记题型重要</li>
<li>② 每个主题都可能考 — 不要猜题</li>
<li>③ 公式表会提供 — 但要知道每个符号的含义和适用条件</li>
<li>④ FBD是基础 — 画好FBD问题解决一半</li>
<li>⑤ 叉积务必熟练 — i×j=k, j×k=i, k×i=j, 反向为负</li>
<li>⑥ 速度和加速度都是矢量 — 要分解到坐标方向</li>
<li>⑦ 极坐标中e<sub>r</sub>和e<sub>θ</sub>会旋转 — 这是所有额外项的来源</li>
</ul>
""")

html.append("</body></html>")

out = "C:/Users/27554/Desktop/QQBot/H7120Z_analysis.html"
with open(out, "w", encoding="utf-8") as f:
    f.write("\n".join(html))
import os
sz = os.path.getsize(out)
print(f"HTML: {sz/1024:.0f}KB")
