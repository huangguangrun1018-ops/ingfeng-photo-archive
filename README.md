# 兽聚返图收集册

这是一个用于整理兽聚返图的个人静态网站。相册按“时间 + 兽聚名称”分类，适合免费部署到 GitHub Pages、Netlify 或 Vercel。

## 文件说明

- `index.html`：网站页面内容
- `styles.css`：网站视觉样式
- `script.js`：分类筛选和大图预览交互
- `assets/photos/`：照片文件夹

## 替换照片

把自己的返图放入 `assets/photos/`，然后在 `index.html` 里把对应的图片路径、标题、时间和兽聚名称改成自己的内容。

## 上线与同步

推荐使用 GitHub Pages 托管这个静态网站，正式域名为：

```text
www.jingfeng.com
```

### 第一次上线

1. 在 GitHub 新建一个仓库，例如 `jingfeng-photo-archive`。
2. 把本地项目关联到仓库：

```bash
git remote add origin 你的仓库地址
git add .gitignore CNAME README.md index.html script.js styles.css sync-online.sh assets/photos
git commit -m "上线兽聚返图网站"
git push -u origin main
```

3. 打开仓库的 `Settings`。
4. 进入 `Pages`。
5. `Source` 选择 `Deploy from a branch`。
6. `Branch` 选择 `main` 和 `/root`。
7. 在 `Custom domain` 填入 `www.jingfeng.com`。
8. 到域名服务商后台添加一条 CNAME 解析：

```text
主机记录：www
记录类型：CNAME
记录值：你的 GitHub Pages 地址
```

### 后续同步

之后本地新增相册、删除照片或改页面后，运行：

```bash
./sync-online.sh "更新相册"
```

GitHub Pages 会在推送后自动更新线上网站。
