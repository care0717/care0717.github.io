---
title: "GitHub Pages + jekyllでブログ作り"
---

# {{ page.title }}
ブラウザだけで完結してかつMarkdownで書けるようなブログを作りたくて、たどり着いた

## 理解に時間がかかったこと
- YYYY-MM-DD-title.mdを置くと /YYYY/MM/DD/title でアクセスできる
  - ファイル名を今日の日付にすると表示されない
    - 時差の問題もあるかも
  - メタデータで指定されたdateはファイル名よりも優先される
- layout: postやpageを指定すると逆にレイアウトが崩れる
  - 何も指定しなくてよい

