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
