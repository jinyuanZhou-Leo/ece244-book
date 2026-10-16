# 本地构建与预览

在仓库根目录 `ece244-book` 下操作。在线版教材：[learningcpp.org](https://learningcpp.org)。

## 环境说明

| 项目 | 说明 |
|------|------|
| **Python 版本** | **3.12**（`.python-version`）；允许范围 `>=3.12, <3.14`（见 `pyproject.toml`） |
| **Python / 虚拟环境** | **[uv](https://docs.astral.sh/uv/)** 安装解释器、创建 `.venv`、安装依赖 |
| **依赖定义** | `pyproject.toml` + 锁定文件 `uv.lock` |
| **练习与静态资源** | **Node.js**（`npm install`；TOML 转 JS） |

不要用系统自带的 **Python 3.14** 对本项目执行 `pip install`：Homebrew 会报 `externally-managed-environment`，且 3.14 与当前 **Jupyter Book 0.13.1** 不兼容。一律使用 `uv sync` / `uv run`。

### 前置工具

1. 安装 [uv](https://docs.astral.sh/uv/getting-started/installation/)
2. 安装 [Node.js](https://nodejs.org/)（LTS 即可）

```bash
git clone https://github.com/salma-emara/ece244-book/
cd ece244-book
npm install
uv sync
```

`uv sync` 会按 `.python-version` 使用 CPython 3.12，并在项目下生成 `.venv/`（已加入 `.gitignore`）。

### 可选依赖组

```bash
uv sync --group dev          # pyspelling（拼写检查）
uv sync --group embeddings   # 语义搜索生成（sentence-transformers 等）
```

## 构建教材

构建输出目录：`textbook/_build/html/`。

### 首次完整构建

```bash
node ./textbook/_static/toml_to_js_convertor.js
uv run jupyter-book build --all textbook
cp -r textbook/exercises/ textbook/_build/html/exercises
cp -r embeddings/outputs textbook/_build/html
```

最后一行复制的是已提交的语义搜索数据；只有在你重新生成 embedding 时才需要再跑生成脚本（见下文）。

### 只改了章节 Markdown（`.md`）

```bash
uv run jupyter-book build textbook
```

若改了目录结构或 `textbook/_toc.yml`、`_config.yml`，请用全量构建：

```bash
uv run jupyter-book build --all textbook
```

### 改了练习（`textbook/exercises/**/*.toml`）

```bash
node ./textbook/_static/toml_to_js_convertor.js
uv run jupyter-book build --all textbook
cp -r textbook/exercises/ textbook/_build/html/exercises
```

编辑练习后若需统一题目 ID，可先运行：

```bash
node ./textbook/_static/add_question_ids.js
```

校验 TOML：

```bash
node textbook/exercises/toml-parser.js
```

### 语义搜索（可选）

内容变更且需要更新搜索索引时：

```bash
uv sync --group embeddings
uv run python embeddings/generate.py
cp -r embeddings/outputs textbook/_build/html
```

### C++ 可视化 trace（可选）

若修改了使用 cpp-visualizer 的页面：

```bash
uv run jupyter-book build --all textbook
cd textbook
uv run python viztrace_cpp_folder.py chapters
cd ..
cp -r textbook/trace textbook/_build/html
```

## 多语言（i18n）

英文版仍构建在站点根目录，每种译文构建到 `textbook/_build/html/<语言代码>/`（目前只有 `zh_CN`），页眉右侧的语言菜单可在同一页面的不同语言版本之间切换。翻译分两部分，都用现成工具：

| 内容 | 工具 | 译文位置 |
|------|------|----------|
| 正文、目录、`_templates/` 中的 `{{ _('...') }}` 字符串 | Sphinx gettext + [sphinx-intl](https://sphinx-intl.readthedocs.io/) | `textbook/locale/zh_CN/LC_MESSAGES/**/*.po` |
| 主题自带的界面文字（上一页、下一页等） | sphinx-book-theme 内置翻译 | 无需维护 |
| 自定义 JS 组件文字（练习、提示、memory-stepper 等） | [i18next](https://www.i18next.com/) | `textbook/_static/i18n/locales.js` |

### 更新与翻译 `.po`

修改英文正文后，重新抽取待翻译文本并合并进已有 `.po`（已翻译的条目会保留，原文有变化的条目会标记为 `fuzzy`）：

```bash
uv sync --group i18n
uv run --group i18n python scripts/i18n.py extract
```

然后用任意 PO 编辑器（如 [Poedit](https://poedit.net/)）或直接编辑 `.po` 文件，填写 `msgstr`。注意：

- `msgid` 是 MyST 源码片段，译文需保留其中的 Markdown 语法、链接和行内代码。
- 中文引号直接写 `“ ”`，不要写 ASCII `"`，否则会被 smartquotes 转成错误方向的弯引号。
- 留空或标记为 `fuzzy` 的条目会显示英文原文。
- 代码块不会被抽取，保持原样。

查看翻译进度：

```bash
uv run --group i18n sphinx-intl stat -d textbook/locale
```

### 构建译文

先完成英文构建（见上文），再运行：

```bash
uv run python scripts/i18n.py build --all     # 输出到 textbook/_build/html/zh_CN/
```

`.mo` 文件由 Sphinx 在构建时自动从 `.po` 编译，不需要提交。

### 新增语言

1. 在 `scripts/i18n.py` 的 `LANGUAGES` 和 `textbook/_static/i18n/i18n.js` 的 `LANGUAGES` 中加入该语言；
2. 在 `textbook/_static/i18n/locales.js` 中加入对应的组件文字；
3. 运行 `scripts/i18n.py extract` 生成 `.po` 并翻译。

### 目前未覆盖

- `textbook/exercises/**/*.toml` 中的题目内容（题干、答案、解析）仍为英文；
- 语义搜索的索引数据只有英文，`zh_CN` 版本的语义搜索不可用；
- 第三方组件（code-runner、Python Tutor 可视化）自身的按钮文字。

## 本地预览（启动）

**推荐**：用 HTTP 服务打开构建结果，搜索与语义搜索才能正常工作。

```bash
cd textbook/_build/html
uv run python -m http.server 8000
```

浏览器访问：**http://localhost:8000**（首页会跳转到 `cover.html`）。

macOS 可另开终端执行：

```bash
open http://localhost:8000
```

停止服务：在运行 `http.server` 的终端按 `Ctrl+C`。

若尚未构建或构建失败，请先完成上一节中的构建步骤；若 `_build/html` 已存在且内容未改，可直接启动服务预览。

### 不推荐：直接打开 HTML 文件

```bash
open textbook/_build/html/index.html
```

`file://` 协议下部分功能（如搜索）可能因浏览器 CORS 限制无法使用。

## 常用命令速查

```bash
# 环境
uv sync

# 增量构建
uv run jupyter-book build textbook

# 全量构建
uv run jupyter-book build --all textbook

# 预览
cd textbook/_build/html && uv run python -m http.server 8000
```

也可激活虚拟环境后省略 `uv run`：

```bash
source .venv/bin/activate
jupyter-book build textbook
```

## 故障排除

| 现象 | 处理 |
|------|------|
| `externally-managed-environment` | 不要用系统 `pip`；在项目根目录执行 `uv sync` |
| `No module named 'imghdr'` | 当前用了 Python 3.14；应使用本项目的 uv 环境（3.12） |
| `No module named 'pkg_resources'` | 重新 `uv sync`（`pyproject.toml` 已限制 `setuptools<81`） |
| 练习页面空白或旧内容 | 重新运行 `toml_to_js_convertor.js` 并 `cp` exercises 目录 |
| 端口 8000 被占用 | 改用其他端口，例如 `uv run python -m http.server 8080` |

部署到 Netlify 的流程见仓库根目录 `netlify.toml`（构建同样通过 `uv sync --frozen` 安装 Python 依赖）。
