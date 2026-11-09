# 美术工具箱

Harness 插件 `@local/art-toolbox`，版本 **0.4.0**。从会话侧栏打开五类制作入口：Blender 材质、照片建模、参数化建模、工程整理、资产汇总。插件将输入和默认要求交给当前会话智能体，沿用当前模型；实际制作由智能体调用后台工具完成。

## 前置条件

- 已安装支持 Cordis bundle、Web Client 和 `plugin_manager` 的 DeepSeek Harness。Host 需提供 storageDomain、connection、tools、sessionController、attachments，Client 需提供会话界面与插槽服务。
- 已有可用的智能体与后台脚本执行工具。图片任务需要支持图片输入的模型。
- 已安装 Blender 并能通过后台 CLI 执行脚本。材质与照片建模默认指定 Blender 4.2.3；其他版本可在默认设置中调整，并自行验证工程兼容性。工程输入路径必须在 Harness Host 所在机器可访问。
- 照片建模默认要求 `photo-modeling-lite` 技能，需另行准备并确保智能体可加载；本包不附带该技能或 Blender。若使用自己的流程，请先编辑保存照片建模默认设置。
- Host 标准依赖为 `zod` 4.4.3，由安装流程按 package.json 解析。React 和 Harness Client 模块由宿主提供，不使用本机安装路径。

## 一句话安装

把 https://github.com/nuet9/dsh-art-toolbox 发给 Harness，并说：“请按 README 下载并安装美术工具箱，检查 Blender 和图片模型是否可用，缺少的条件告诉我，安装后验证五个入口。”

## 安装

1. 下载并解压本插件到长期保留的目录，找到包含 package.json 和 cordis.patch.yml 的文件夹。
2. 在 Harness 中请智能体调用 `plugin_manager`，使用 **解压后插件文件夹的绝对路径** 作为 target。例如（请替换为实际路径）：

```json
{
  "action": "install_bundle",
  "target": "C:/HarnessPlugins/art-toolbox"
}
```

3. 检查安装返回的 application 和 warnings；applied 表示配置已应用。若提示重启则按提示重启，必要时刷新 Web 页面。打开会话后，在左下侧栏点击立方体图标。

目录安装可能链接源目录，请保留解压目录，不要安装后删除或移动。该包保留原 bundle 名称，已有同名安装会按宿主规则处理。卸载或停用使用 Harness 插件管理器中的 `@local/art-toolbox`。本包用于 GitHub 源码/目录分发，private 标记保留以避免误发 npm。

## 使用

- 材质、照片建模：选择 PNG/JPG/WebP 参考图，最大 20 MiB；补充要求选填。
- 参数化建模：提供参考图或文字需求，至少一项；支持按任务选择几何节点、曲线、面或参数驱动。
- 工程整理：填写一个绝对 `.blend` 路径。资产汇总：每行一个路径，共 2–20 个；提交时检查文件类型、存在性和重复路径。默认保留原件并另存输出。
- 五项工具分别保存默认设置；编辑后先保存，再开始制作。任务提交到当前会话，忙时排队。关闭窗口后可在会话继续提出修改。
- 点击“刷新结果”读取任务反馈；执行智能体通过 `art_toolbox` 的 report 回报进度、成果和限制。completed 必须提供实际存在的成果文件，提交成功仅表示进入队列。小于 4 MiB 的 PNG/JPG/WebP 成果可预览。

设置与任务记录通过 Harness storageDomain 保存。未提交的图片和文字保留于当前页面，刷新后清空；开始制作后图片进入宿主原生附件流程。结果需手动刷新，停止任务使用会话原生停止功能。目录链接的打开行为由宿主及已安装的文件链接插件决定。

## 文件与回归

当前运行文件是 index-v6.js、client-v5.js、model-v5.js、defaults-v5.js；另含补丁、图标、中英文插件元数据和两个回归脚本。旧实现、个人会话记录和历史验证日志不随包分发。

在包目录使用 Node.js 运行以下命令（在 Harness 中通过后台任务执行并收集输出）：

```sh
node tests/regression.mjs
node tests/projects.mjs
```

也可使用 `npm test`。回归只需 Node.js 内置模块，不安装依赖、不启动 Blender、不提交真实会话任务。覆盖默认设置、revision 冲突、请求去重、附件校验、回报会话隔离、成果校验、失败重试、参数化文字/图片输入、工程路由与非法路径、已移除展示图入口拒绝。测试使用存储、附件、文件检查和会话服务替身；通过不代表实际 Blender 制作、UI 点击或新机器安装已验证。
