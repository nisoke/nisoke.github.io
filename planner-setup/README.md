# Sunrise Realm · 计划与周结

此栏目与原 Hexo 博客独立。网站代码部署在 GitHub Pages，个人记录存放在 Supabase。
页面地址：https://nisoke.github.io/planner/
周结入口：https://nisoke.github.io/planner/#review

## 一次性接入云端

1. 在 https://supabase.com/dashboard 注册并创建项目，数据库密码自己保管。
2. 打开 SQL Editor → New query，粘贴本目录的 schema.sql 并运行一次。
   成功后 Table Editor 应出现 planner_entries。不要重复执行；它不是覆盖或重置脚本。
3. 在 Authentication → Users 中选择 Add user / Create new user，创建你自己的邮箱和密码账号，
   如有 Auto confirm user 选项请勾选。日常使用的是这个账号，不是数据库密码。
4. 在 Authentication 的登录 / 注册设置中关闭允许新用户注册（Allow new users to sign up）。
   本页面没有开放注册；数据库规则会进一步隔离每个账号的数据。
5. 从项目 Connect 或 Settings → API Keys 取得 Project URL 和 Publishable key。
   也支持 legacy anon 公钥。不要使用 secret / service_role / 数据库密码。
6. 修改 master 分支的 planner/config.js：

   window.PLANNER_CONFIG = {
     supabaseUrl: "https://你的项目编号.supabase.co",
     supabasePublishableKey: "sb_publishable_你的公开密钥"
   };

   这两个值可以公开；数据访问由登录账号与数据库行级访问规则控制。
7. 等待 GitHub Pages 发布完成，访问栏目，使用第 3 步的账号登录。
8. 在电脑新增一条测试任务并保存；在手机登录同一账号，确认可读取。
   再从手机修改，电脑点击「同步最新」确认变化。

## 记录与同步

- 添加、编辑、完成、移除任务都会写入云端，成功后才显示保存成功。
- 周结需要点击「保存周结」。切换周次和刷新前会提醒未保存修改。
- 同步最新会重新读取当前周的数据；不进行后台实时覆盖。
- 使用相同记录的版本号防止不同设备的旧内容覆盖新内容。
  如出现冲突，先导出当前周结或复制任务编辑内容，再同步最新并重新编辑。
- 已移除任务可在「查看已移除」中恢复。没有永久删除按钮。
- 离线时不能保存到云端。编辑暂留在页面，关闭前请复制或导出。
- 导出本周为 Markdown，包含当前未保存的周结文本，但不包含未提交的任务弹窗。
- 退出登录会清空页面显示；登录会话保存在当前浏览器。共用设备使用后请退出。
- 体验模式只有内存中的示例数据，刷新后清空；不会发送到 Supabase。
- 目前不支持图片上传、提醒推送或自动把周结发布到公开博客。

## 验证隐私

使用未登录浏览器打开栏目，只应看到登录页。
如测试第二个账号，不应读到第一个账号的记录。
schema.sql 开启 RLS，仅授权已登录用户读写自己 user_id 对应的记录。
云端未配置时，页面明确提示未接入，登录按钮禁用。

## 以后从原电脑发布 Hexo

先备份或拉取 master 上的 planner/ 目录和首页入口。
将 planner/ 放到原 Hexo 项目的 source/planner/，按 Hexo 的 skip_render 配置
保持这些静态资源不经模板渲染，并在主题导航添加 /planner/。
确认生成结果保留栏目，再执行原部署命令，避免覆盖掉新增文件。

## 文件

planner/index.html：界面
planner/style.css：响应式样式
planner/app.js：登录、编辑、云端存储、冲突提示与导出
planner/config.js：公开的连接配置
schema.sql：云端表和行级访问规则

参考：https://supabase.com/docs/guides/database/postgres/row-level-security
