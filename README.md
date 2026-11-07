# Super MAGA Bros.

一个基于 FullScreenMario 的浏览器横版游戏原型。第一关以华盛顿街景、像素人物和戏仿元素进行改编；开场动画可按 Enter 或点击跳过。项目主要面向桌面浏览器，第一关是主要体验范围，其他关卡尚未逐一验收。

## 本地试玩

需要安装 Node.js 18 或更高版本，无需 `npm install`：

```bash
git clone https://github.com/rongchang606-a11y/super-maga-bros.git
cd super-maga-bros
node serve.js
```

用浏览器打开终端显示的本地地址。Windows 用户也可以双击 `开始游戏.bat`；保持服务窗口开启，关闭窗口即停止服务。游戏资源需要通过 HTTP 服务加载，请不要直接双击打开 HTML 文件。

方向键或 A/D 移动；空格、W 或上方向键跳跃；S 或下方向键下蹲；Shift 或 Ctrl 加速，获得麦克风能力后也可按键发射；P 暂停。页面下方的按钮可切换主角样例，Maps 可选择关卡。

## 构建和部署

```bash
npm run build
node serve.js --root Distribution/Super-MAGA-Bros
```

构建会检查必需的脚本和素材，并生成 `Distribution/Super-MAGA-Bros` 静态目录。把该目录的**内容**上传到任意静态网站托管服务，即可让其他人通过浏览器游玩。项目内含 GitHub Pages 工作流；仓库的 Settings → Pages → Build and deployment → Source 选择 **GitHub Actions** 后，推送主分支即可自动构建和部署。也可使用 Actions 页面手动运行工作流。

更详细的素材对应和测试范围见 [素材映射与验收](素材映射与验收.md) 和 [游玩说明](游玩说明.md)。游戏以原项目 MIT 许可证发布，素材及相关角色的权利归相应权利人所有。

---

## 原项目：FullScreenMario [![Build Status](https://travis-ci.org/FullScreenShenanigans/FullScreenMario.svg?branch=master)](https://travis-ci.org/FullScreenShenanigans/FullScreenMario)

#### A free HTML5 remake of Nintendo's original Super Mario Bros, expanded for the modern web. It includes the original 32 levels, a random map generator, a level editor, and over a dozen custom mods.


## How to Play

Although you may no longer play on [fullscreenmario.com](http://www.fullscreenmario.com), it is easy to play your own copy.

#### Newcomers (non-coders)

[Download the latest release](https://github.com/FullScreenShenanigans/FullScreenMario/releases) of this project, extract that onto your computer, and open **index.html** in a browser (preferably Google Chrome). That's it!

#### In your own site

Upload the latest release of FullScreenMario (or your built version) to your FTP server. 


## Developing

#### Build Process

FullScreenMario uses [Grunt](http://gruntjs.com/) to automate building, which requires [Node.js](http://node.js.org). The process is straightforward; see [Grunt's help page](http://gruntjs.com/getting-started).

#### Coding

FullScreenMario is built on a modular framework called GameStartr. The [FullScreenShenanigans](https://github.com/FullScreenShenanigans/) organization contains GameStartr, its parent class EightBittr, and the modules used by the GameStartr framework. These all (theoretically) have their own README files, which you should skim before developing for FullScreenMario itself.

All source code is in the [Source](Source/) directory. See [Getting Started.md](Getting Started.md) for an in-depth guide on getting started programming with FullScreenMario.

The FullScreenMario.ts class declaration contains class functions and some constants, while static settings to be added to the FullScreenMario prototype, such as map layouts and object attributes, are stored in files under [Source/settings](Source/settings), such as audio.js and collisions.js.


## Legal

This is released under the [MIT License](http://mit-license.org/) (see [License.txt](LICENSE.txt)). 

The FullScreenMario project started October 21st, 2012. The initial beta release in October 2013 saw the [primary host website](http://www.fullscreenmario.com) receive approximately 2.68 million unique visitors within a month, after which Nintendo shut the site down with a DMCA complaint (no action was taken against the authors, GitHub, or other hosting websites). The coding project then underwent an extensive rewrite and architecture change to become a modular project centered on the GameStartr platform, followed by a complete conversion to TypeScript.
