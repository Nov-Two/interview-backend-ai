# GitHub Actions + Docker 自动化部署指南

既然 Jenkins 插件安装困难，我们采用更轻量、更现代的方案：**GitHub Actions**。

**原理**：
当你推送代码到 GitHub 时，GitHub Actions 会自动通过 SSH 连接到你的服务器，执行 `git pull` 拉取最新代码，然后运行 `docker-compose` 重新构建并启动应用。

## 1. 服务器端准备

你需要先在服务器上把项目克隆下来（只需做一次）。

1.  **连接服务器**:
    ```bash
    ssh root@8.134.131.208
    ```

2.  **安装 Git (如果未安装)**:
    ```bash
    apt-get update && apt-get install -y git
    # 或者 CentOS: yum install -y git
    ```

3.  **克隆代码**:
    建议放在 `/home` 目录下：
    ```bash
    cd /home
    # 替换成你的 GitHub 仓库地址
    git clone https://github.com/你的用户名/你的仓库名.git interview-backend-ai
    ```
    *注意：如果是私有仓库，你需要配置 SSH Key 或者输入账号密码。推荐在服务器生成 SSH Key (`ssh-keygen`) 然后添加到 GitHub 的 Deploy Keys 中。*

4.  **进入目录并首次启动**:
    ```bash
    cd /home/interview-backend-ai
    docker-compose up -d --build
    ```
    确保首次启动成功，服务正常运行。

## 2. 配置 GitHub Secrets

为了让 GitHub Actions 能登录你的服务器，你需要配置“秘密变量”。

1.  打开你的 GitHub 仓库页面。
2.  点击 **Settings** -> **Secrets and variables** -> **Actions**。
3.  点击 **New repository secret**，添加以下三个变量：

| Name | Secret | 说明 |
| :--- | :--- | :--- |
| `SERVER_HOST` | `8.134.131.208` | 你的服务器 IP |
| `SERVER_USER` | `root` | 登录用户名 |
| `SERVER_PASSWORD` | `Xg1218..` | 你的服务器密码 |

*注意：使用密码虽然简单，但建议未来改用 SSH Key (`SERVER_SSH_KEY`) 以提高安全性。*

## 3. 验证自动化部署

1.  **修改代码**: 在本地修改一下 `README.md` 或其他文件。
2.  **提交并推送**:
    ```bash
    git add .
    git commit -m "Test GitHub Actions deploy"
    git push origin main
    ```
3.  **查看进度**:
    *   打开 GitHub 仓库的 **Actions** 标签页。
    *   你应该能看到一个新的 Workflow 正在运行。
    *   点击进去可以看到详细日志。
4.  **验证结果**:
    *   等 Workflow 显示绿色勾号（Success）。
    *   访问你的接口，确认更新已生效。

## 4. 目录结构说明

*   `.github/workflows/deploy.yml`: GitHub Actions 的配置文件，定义了何时触发部署以及如何部署。
*   `deploy.sh`: 服务器端执行的脚本，负责 `git pull` 和 `docker-compose up`。

## 5. 常见问题

*   **权限错误**: 如果 GitHub Actions 提示 `Permission denied`，请检查 `deploy.sh` 是否有执行权限 (`chmod +x deploy.sh`)。
*   **Git Pull 失败**: 如果服务器上 `git pull` 提示需要密码，说明服务器没有配置好免密拉取。请在服务器上配置 SSH Key 并添加到 GitHub Deploy Keys，或者使用 HTTPS 方式并在 URL 中包含 Token。
