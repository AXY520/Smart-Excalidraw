# 懒猫云应用

## 开发
```
lzc-cli project devshell
```

进入应用容器,并且自动同步当前目录内容到容器
然后就可以启动你的应用了,例如前端
npm install
npm run dev

## 构建
```
lzc-cli project build -o you-awesome.lpk
```

会在当前的目录下构建出一个 lpk 包。

## 安装
```
lzc-cli app install you-awesome.lpk
```

会安装在你的微服应用中,安装成功后可在懒猫微服启动器中查看!

## 交流和帮助

你可以在 https://bbs.lazycat.cloud/ 畅所欲言。
